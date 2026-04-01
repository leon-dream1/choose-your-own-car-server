import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { carControllers } from './car.controller';
import { carValidation } from './car.validation';
import { upload } from '../../middlewares/multer';

const router = Router();

router.get('/my-cars', auth('seller'), carControllers.getMyCars);
router.get('/:id', carControllers.getSingleCar);
router.get('/', carControllers.getAllApprovedCars);

router.post(
  '/',
  auth('seller'),
  validateRequest(carValidation.createCarValidation),
  upload.array('images', 5),
  carControllers.createCar
);

router.patch('/:id/status', auth('admin'), carControllers.updateCarStatus);
router.patch(
  '/:id',
  auth('seller'),
  validateRequest(carValidation.updateCarValidation),
  upload.array('images', 5),
  carControllers.updateCar
);
router.delete('/:id', auth('seller', 'admin'), carControllers.deleteCar);

export const carRoutes = router;
