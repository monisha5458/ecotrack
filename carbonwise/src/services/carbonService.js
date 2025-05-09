import CarbonRecord from '../models/CarbonRecord.js';
import LeaderBoard  from '../models/LeaderBoard.js';

const FACTORS = {
  transport:   0.21,
  electricity: 0.000233,
  wastage:     0.5
};

export async function getAllCarbonDetails() {
  return CarbonRecord.find();
}

export async function getByUser(userId) {
  return CarbonRecord.find({ userId }).sort({ date: 1 });
}

export async function getDashboard(userId) {
  const recs = await getByUser(userId);
  return recs.map(r => ({
    date: r.date.toISOString().split('T')[0],
    totalCarbonFootprint: r.carbonFootprint
  }));
}

export async function getElectricity(userId) {
  const recs = await getByUser(userId);
  return recs.map(r => ({
    date: r.date.toISOString().split('T')[0],
    electricity: (r.todayWatts - r.prevWatts) * FACTORS.electricity
  }));
}

export async function getWastage(userId) {
  const recs = await getByUser(userId);
  return recs.map(r => {
    const sumWaste = r.wastages.reduce((s, w) => s + w.wetWaste + w.dryWaste, 0);
    return { date: r.date.toISOString().split('T')[0], wastage: sumWaste * FACTORS.wastage };
  });
}

export async function getTransportation(userId) {
  const recs = await getByUser(userId);
  return recs.map(r => {
    const km = r.transportations.reduce((s, t) => s + t.distance, 0);
    return { date: r.date.toISOString().split('T')[0], transportation: km * FACTORS.transport };
  });
}

export async function getLeaderBoard(city) {
  const agg = await CarbonRecord.aggregate([
    { $match: { city } },
    { $sort: { date: -1 } },
    {
      $group: {
        _id: '$userId',
        name: { $first: '$name' },
        date: { $first: '$date' },
        totalCarbon: { $first: '$carbonFootprint' }
      }
    },
    { $sort: { totalCarbon: -1 } }
  ]);
  return agg.map(a => ({
    userId: a._id,
    name: a.name,
    date: a.date,
    city,
    totalCarbon: a.totalCarbon
  }));
}

export async function calculateAndSubmit(form) {
  const transportCO2   = form.transportations.reduce((s,t)=>s+t.distance,0) * FACTORS.transport;
  const electricityCO2 = (form.todayWatts - form.prevWatts) * FACTORS.electricity;
  const wastageCO2     = form.wastages.reduce((s,w)=>s+w.wetWaste+w.dryWaste,0) * FACTORS.wastage;
  const total = transportCO2 + electricityCO2 + wastageCO2;

  const rec = await CarbonRecord.create({
    userId: form.userId,
    name: form.name,
    date: form.date,
    city: form.city,
    transportations: form.transportations,
    wastages: form.wastages,
    prevWatts: form.prevWatts,
    todayWatts: form.todayWatts,
    carbonFootprint: total
  });

  await LeaderBoard.findOneAndUpdate(
    { userId: form.userId, city: form.city },
    { name: form.name, date: form.date, totalCarbon: total },
    { upsert: true }
  );

  return rec;
}
