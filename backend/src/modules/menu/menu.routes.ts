import { Request, Response, NextFunction, Router } from 'express';
import { MenuController } from './menu.controller';
import { menuImageUpload } from './menu.upload';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { ROLES } from '../../constants/roles';

export const menuRouter = Router();
const controller = new MenuController();

// multer reports invalid-file/too-large errors via callback, not a thrown error —
// this wrapper turns that into the same { message } JSON shape as every other 400 here.
function uploadSingleImage(req: Request, res: Response, next: NextFunction) {
  menuImageUpload.single('image')(req, res, (err: unknown) => {
    if (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : 'Upload failed' });
      return;
    }
    next();
  });
}

menuRouter.use(authenticate);

menuRouter.get('/items', controller.list);
menuRouter.post('/items', authorize(ROLES.ADMINISTRATOR, ROLES.MANAGER), controller.create);
menuRouter.patch('/items/:id', authorize(ROLES.ADMINISTRATOR, ROLES.MANAGER), controller.update);
menuRouter.delete('/items/:id', authorize(ROLES.ADMINISTRATOR, ROLES.MANAGER), controller.remove);
menuRouter.post('/upload', authorize(ROLES.ADMINISTRATOR, ROLES.MANAGER), uploadSingleImage, controller.uploadImage);
