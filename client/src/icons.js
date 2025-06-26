// src/icons.js
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faPlay, faPause, faStop, faPlus, faMinus, faTrash, faCopy, faPaste, faSync,
  faStepBackward, faStepForward, faUndo, faRedo, faMicrochip, faTimes, faEye,
  faEyeSlash, faCheck, faSave, faFolderOpen, faFilm, faVideo, faGripLines, faCog, faTools,
  faFastBackward, faFastForward, faTrashAlt, faMusic
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faPlay, faPause, faStop, faPlus, faMinus, faTrash, faCopy, faPaste, faSync,
  faStepBackward, faStepForward, faUndo, faRedo, faMicrochip, faTimes, faEye,
  faEyeSlash, faCheck, faSave, faFolderOpen, faFilm, faVideo, faGripLines, faCog, faTools,
  faFastBackward, faFastForward, faTrashAlt, faMusic // <-- And ensure they are added here
);