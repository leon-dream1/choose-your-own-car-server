import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { carControllers } from './car.controller';
import { carValidation } from './car.validation';
import { upload } from '../../middlewares/multer';

const router = Router();

router.get('/my-cars', auth('seller'), carControllers.getMyCars);
router.get('/featured', carControllers.getFeaturedCars);
router.get('/pending', auth('admin'), carControllers.getPendingCars);
router.get('/', carControllers.getAllApprovedCars);
router.get('/:id', carControllers.getSingleCar);

router.post(
  '/',
  auth('seller'),
  validateRequest(carValidation.createCarValidation),
  upload.array('images', 5),
  carControllers.createCar
);

router.patch('/:id/status', auth('admin'), carControllers.updateCarStatus);
router.patch('/:id/featured', auth('admin'), carControllers.toggleFeatured);
router.patch(
  '/:id',
  auth('seller', 'admin'),
  validateRequest(carValidation.updateCarValidation),
  upload.array('images', 5),
  carControllers.updateCar
);

router.delete('/:id', auth('seller', 'admin'), carControllers.deleteCar);

export const carRoutes = router;
