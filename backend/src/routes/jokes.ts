import express from 'express';
import { getRandomJokeOrRiddle, getNextJokeOrRiddle } from '../services/jokesService';

const router = express.Router();

// Get random joke or riddle
router.get('/random', (req, res) => {
  const joke = getRandomJokeOrRiddle();
  res.json(joke);
});

// Get next joke or riddle (rotating)
router.get('/next', (req, res) => {
  const joke = getNextJokeOrRiddle();
  res.json(joke);
});

export default router;

