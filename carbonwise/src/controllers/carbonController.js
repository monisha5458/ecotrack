import axios from 'axios';
import * as carbonSvc from '../services/carbonService.js';
import dotenv from 'dotenv';
dotenv.config();

const USER_SERVICE = process.env.USER_SERVICE_URL;

export async function getUserProfile(req, res, next) {
  try {
    // 1) Extract the Bearer token from the incoming request
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No Authorization header provided' });
    }

    // 2) Forward the same header to the user‑service
    const user = await axios.get(
      `${USER_SERVICE}/${req.params.userId}`,
      { headers: { Authorization: authHeader } }
    );
    res.json(user.data);
  } catch (e) {
    next(e);
  }
}


export async function getAllUsers(req, res, next) {
  try {
    const users = await axios.get(USER_SERVICE);
    res.json(users.data);
  } catch (e) { next(e); }
}

export async function allCarbonDetails(req, res, next) {
  try {
    res.json(await carbonSvc.getAllCarbonDetails());
  } catch (e) { next(e); }
}

export async function dashboard(req, res, next) {
  try {
    res.json(await carbonSvc.getDashboard(req.params.userId));
  } catch (e) { next(e); }
}

export async function electricity(req, res, next) {
  try {
    res.json(await carbonSvc.getElectricity(req.params.userId));
  } catch (e) { next(e); }
}

export async function wastage(req, res, next) {
  try {
    res.json(await carbonSvc.getWastage(req.params.userId));
  } catch (e) { next(e); }
}

export async function transportation(req, res, next) {
  try {
    res.json(await carbonSvc.getTransportation(req.params.userId));
  } catch (e) { next(e); }
}

export async function leaderBoard(req, res, next) {
  try {
    res.json(await carbonSvc.getLeaderBoard(req.params.city));
  } catch (e) { next(e); }
}

export async function calculateAndSubmit(req, res, next) {
  try {
    const record = await carbonSvc.calculateAndSubmit(req.body);
    res.status(201).json({
      message: 'Calculation successful',
      totalCarbonEmission: record.carbonFootprint
    });
  } catch (e) {
    next(e);
  }
}

