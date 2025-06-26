// SEGSYNC/backend/services/auth.service.js
const supabaseAdmin = require('../config/supabaseAdmin');
const ApiError = require('../utils/ApiError');

const registerUser = async ({ username, email, password, defaultRoleName = 'user' }) => {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: process.env.NODE_ENV === 'production', 
    user_metadata: { username: username }
  });

  if (authError) {
    if (authError.message.includes('User already registered') || authError.message.includes('already exists')) {
      throw new ApiError('User with this email already exists.', 409);
    }
    console.error("Supabase auth.admin.createUser error:", authError);
    throw new ApiError(authError.message || 'Failed to create user in Supabase Auth.', authError.status || 500);
  }

  const newUser = authData.user;
  if (!newUser) {
    throw new ApiError('User creation via Supabase did not return a user object.', 500);
  }

  try {
    // Get the ID of the default role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', defaultRoleName)
      .single(); // Expect a single role

    if (roleError || !roleData) {
      console.error(`Default role '${defaultRoleName}' not found. Error:`, roleError);
      await supabaseAdmin.auth.admin.deleteUser(newUser.id); // Cleanup auth user
      throw new ApiError(`System configuration error: Default role '${defaultRoleName}' not found.`, 500);
    }
    const defaultRoleId = roleData.id;

    // Insert into public.user_roles
    const { error: userRoleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: newUser.id, role_id: defaultRoleId });

    if (userRoleError) {
      console.error("Error inserting into user_roles:", userRoleError);
      await supabaseAdmin.auth.admin.deleteUser(newUser.id); // Cleanup auth user
      throw new ApiError('Failed to assign default role to user.', 500);
    }
    
    return { 
      user: { 
        id: newUser.id, 
        email: newUser.email, 
        username: newUser.user_metadata.username, 
        created_at: newUser.created_at 
      } 
    };

  } catch (error) { // Catch any error from role logic
    console.error("Error during role assignment part of registration:", error);
    if (newUser && newUser.id) { // Ensure cleanup
        try { await supabaseAdmin.auth.admin.deleteUser(newUser.id); } 
        catch (cleanupErr) { console.error(`CRITICAL: Failed to cleanup auth user ${newUser.id}:`, cleanupErr); }
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to complete user registration due to role assignment issue.', 500);
  }
};

const loginUser = async ({ email, password }) => {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === 'Invalid login credentials') {
        throw new ApiError('Invalid email or password.', 401);
    }
    console.error("Supabase signInWithPassword error (auth.service):", error);
    throw new ApiError(error.message || 'Login failed.', error.status || 401);
  }
  if (!data || !data.session || !data.user) {
    throw new ApiError('Login response from Supabase is incomplete.', 500);
  }

  const { data: roleAssignments, error: rolesError } = await supabaseAdmin
    .from('user_roles')
    .select('roles ( name, description )')
    .eq('user_id', data.user.id);

  const roles = rolesError ? [] : (roleAssignments ? roleAssignments.map(r => r.roles).filter(Boolean) : []);

  return {
    token: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      username: data.user.user_metadata?.username || data.user.email.split('@')[0],
      last_sign_in_at: data.user.last_sign_in_at,
      roles: roles,
    },
  };
};

const getUserProfile = async (userId) => {
    const { data: { user: authUser }, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authUserError) {
        console.error(`Supabase getUserById error for ${userId}:`, authUserError);
        throw new ApiError('Error fetching user from auth provider.', authUserError.status || 500);
    }
    if (!authUser) {
        throw new ApiError('User not found in auth provider.', 404);
    }

    const { data: roleAssignments, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('roles (id, name, description)')
      .eq('user_id', userId);

    const roles = rolesError ? [] : (roleAssignments ? roleAssignments.map(r => r.roles).filter(Boolean) : []);

    return {
        id: authUser.id,
        email: authUser.email,
        username: authUser.user_metadata?.username || authUser.email.split('@')[0],
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        email_confirmed_at: authUser.email_confirmed_at,
        roles: roles,
    };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};