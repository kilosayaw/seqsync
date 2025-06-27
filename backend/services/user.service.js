// SEGSYNC/backend/services/user.service.js
const supabaseAdmin = require('../config/supabaseAdmin');
const ApiError = require('../utils/ApiError');

const findAllUsersWithRoles = async ({ page = 1, limit = 20 }) => {
  const perPage = Math.min(limit, 50);
  const { data: adminListData, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({
    page: page,
    perPage: perPage,
  });

  if (listUsersError) {
    console.error("Supabase listUsers error:", listUsersError);
    throw new ApiError('Failed to retrieve users from auth provider.', listUsersError.status || 500);
  }
  
  const authUsers = adminListData.users || [];
  const totalAuthUsers = adminListData.total !== undefined ? adminListData.total : (adminListData.aud === 'authenticated' ? ((page -1) * perPage + authUsers.length + (authUsers.length === perPage ? 1 : 0)) : 0);


  if (authUsers.length === 0) {
    return { users: [], total: 0, page, limit: perPage, totalPages: 0 };
  }
  
  const userIds = authUsers.map(u => u.id);

  const { data: roleAssignments, error: rolesError } = await supabaseAdmin
    .from('user_roles')
    .select('user_id, roles ( name, description )')
    .in('user_id', userIds);

  if (rolesError) {
    console.error("Error fetching roles for user list (Supabase):", rolesError.message);
    // Continue, roles will be empty for users with fetch errors
  }

  const usersWithRoles = authUsers.map(authUser => {
    const userSpecificRoles = roleAssignments 
      ? roleAssignments.filter(ra => ra.user_id === authUser.id).map(ra => ra.roles).filter(Boolean) 
      : [];
    return {
      id: authUser.id,
      email: authUser.email,
      username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'N/A',
      created_at: authUser.created_at,
      last_sign_in_at: authUser.last_sign_in_at,
      email_confirmed_at: authUser.email_confirmed_at,
      roles: userSpecificRoles,
    };
  });

  return {
    users: usersWithRoles,
    total: totalAuthUsers,
    page,
    limit: perPage,
    totalPages: totalAuthUsers ? Math.ceil(totalAuthUsers / perPage) : 0,
  };
};

const findUserWithRolesById = async (userId) => {
  // This is largely the same as authService.getUserProfile, can be consolidated if desired
  const { data: { user: authUser }, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (authUserError) {
    console.error(`Supabase getUserById error for ${userId}:`, authUserError);
    throw new ApiError('Error fetching user details from auth provider.', authUserError.status || 500);
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

const updateUserRoleAssignment = async (adminUserIdPerformingChange, userIdToUpdate, newRoleName) => {
  // Fetch the role ID for the newRoleName
  const { data: roleToAssign, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('name', newRoleName)
    .single();

  if (roleError || !roleToAssign) {
    console.error(`Role '${newRoleName}' not found. Error:`, roleError);
    throw new ApiError(`Role '${newRoleName}' not found.`, 400);
  }
  const newRoleId = roleToAssign.id;

  // Ensure user exists
  const { data: { user: authUserToUpdate }, error: authUserFetchError } = await supabaseAdmin.auth.admin.getUserById(userIdToUpdate);
  if (authUserFetchError || !authUserToUpdate) {
      throw new ApiError('User to update not found in auth provider.', 404);
  }

  // Perform operations: Delete old, Insert new.
  // For atomicity, this is best done in a PostgreSQL function (RPC call).
  // Simulating sequential operations here:
  try {
    const { error: deleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userIdToUpdate);

    if (deleteError) {
      console.error(`Error deleting old roles for user ${userIdToUpdate}:`, deleteError);
      throw new ApiError('Failed to clear existing user roles before update.', 500);
    }

    const { error: insertError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userIdToUpdate, role_id: newRoleId });

    if (insertError) {
      console.error(`Error inserting new role '${newRoleName}' for user ${userIdToUpdate}:`, insertError);
      // If insert fails after delete, user is left without roles.
      // Consider re-inserting old roles if possible, or use DB transaction via RPC.
      throw new ApiError(`Failed to assign new role '${newRoleName}'. User may have no roles assigned.`, 500);
    }

    console.log(`User ${userIdToUpdate} role updated to ${newRoleName} by admin ${adminUserIdPerformingChange}.`);
    return findUserWithRolesById(userIdToUpdate); // Return updated user profile

  } catch (error) {
    console.error("Error in updateUserRoleAssignment operations:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to update user role due to a server error.', 500);
  }
};

module.exports = {
  findAllUsersWithRoles,
  findUserWithRolesById,
  updateUserRoleAssignment,
};