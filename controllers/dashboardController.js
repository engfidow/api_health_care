

const Appointment = require('../models/appointment.js');

const Doctor = require('../models/Doctor.js');

const getDashboardData = async () => {
  try {
    const [summary, pieData, barData, topDoctors] = await Promise.all([
      getDashboardSummary(),
      getDoctorPieChartData(),
      getAppointmentBarChartData(),
      getTopDoctorsData()
    ]);

    return {
      summary,
      pieChartData: pieData,
      barChartData: barData,
      topDoctors
    };
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    throw new Error('Failed to fetch dashboard data');
  }
};

const getDashboardSummary = async () => {
  try {
    const [totalAppointments, totalDoctors, totalRevenueAgg, pendingAppointments] = await Promise.all([
      Appointment.countDocuments(),
      Doctor.countDocuments(),
      Appointment.aggregate([
        {
          $match: {
            appointmentprice: { $exists: true, $ne: null }
          }
        },
        {
          $addFields: {
            numericPrice: {
              $convert: {
                input: "$appointmentprice",
                to: "double",
                onError: 0,
                onNull: 0
              }
            }
          }
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: "$numericPrice" },
            count: { $sum: 1 }
          } 
        }
      ]),
      Appointment.countDocuments({ status: 'pending' })
    ]);

    const revenueResult = totalRevenueAgg[0] || { total: 0, count: 0 };

    return {
      totalAppointments,
      totalDoctors,
      totalRevenue: revenueResult.total,
      paidAppointments: revenueResult.count,
      pendingAppointments
    };
  } catch (error) {
    console.error('Error in getDashboardSummary:', error);
    return {
      totalAppointments: 0,
      totalDoctors: 0,
      totalRevenue: 0,
      paidAppointments: 0,
      pendingAppointments: 0
    };
  }
};

const getDoctorPieChartData = async () => {
  try {
    const data = await Appointment.aggregate([
      {
        $match: {
          doctorId: { $ne: null }
        }
      },
      { 
        $group: { 
          _id: "$doctorId", 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctor"
        }
      },
      { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: false } },
      {
        $project: {
          name: { $ifNull: ["$doctor.name", "Unknown Doctor"] },
          count: 1
        }
      }
    ]);

    return {
      labels: data.map(d => d.name),
      values: data.map(d => d.count),
      doctors: data
    };
  } catch (error) {
    console.error('Error in getDoctorPieChartData:', error);
    return {
      labels: [],
      values: [],
      doctors: []
    };
  }
};

const getAppointmentBarChartData = async () => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const ranges = [
      { name: 'Today', start: startOfDay },
      { name: 'This Week', start: startOfWeek },
      { name: 'This Month', start: startOfMonth },
      { name: 'This Year', start: startOfYear },
      { name: 'All Time', start: new Date(0) }
    ];

    const counts = await Promise.all(
      ranges.map(range => 
        Appointment.countDocuments({ 
          date: { $gte: range.start } 
        }))
    );

    return {
      labels: ranges.map(r => r.name),
      values: counts,
      ranges
    };
  } catch (error) {
    console.error('Error in getAppointmentBarChartData:', error);
    return {
      labels: [],
      values: [],
      ranges: []
    };
  }
};

const getTopDoctorsData = async () => {
  try {
    const top = await Appointment.aggregate([
      {
        $match: {
          doctorId: { $ne: null }
        }
      },
      { 
        $group: { 
          _id: "$doctorId", 
          count: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $convert: {
                input: "$appointmentprice",
                to: "double",
                onError: 0,
                onNull: 0
              }
            }
          }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctor"
        }
      },
      { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: false } },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ["$doctor.name", "Unknown Doctor"] },
          specialization: { $ifNull: ["$doctor.specialization", "Unknown"] },
          count: 1,
          totalRevenue: 1,
          image: "$doctor.image"
        }
      }
    ]);

    return top;
  } catch (error) {
    console.error('Error in getTopDoctorsData:', error);
    return [];
  }
};



exports.getDashboard = async (req, res) => {
  try {
    const dashboardData = await getDashboardData();
    res.json(dashboardData);
  } catch (err) {
    console.error('Dashboard controller error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


exports.getDoctorDashboard = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    // Find doctor document
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const doctorId = doctor._id;

    // Get total appointments
    const totalAppointments = await Appointment.countDocuments({ doctorId });

    // Total revenue
    const revenueAgg = await Appointment.aggregate([
      { $match: { doctorId } },
      {
        $addFields: {
          numericPrice: {
            $convert: {
              input: "$appointmentprice",
              to: "double",
              onError: 0,
              onNull: 0
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$numericPrice" },
          count: { $sum: 1 }
        }
      }
    ]);
    const revenue = revenueAgg[0] || { total: 0, count: 0 };

    // Bar chart: Appointments per time range
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const ranges = [
      { name: 'Today', start: startOfDay },
      { name: 'This Week', start: startOfWeek },
      { name: 'This Month', start: startOfMonth },
      { name: 'This Year', start: startOfYear },
      { name: 'All Time', start: new Date(0) }
    ];

    const counts = await Promise.all(
      ranges.map(r =>
        Appointment.countDocuments({ doctorId, date: { $gte: r.start } })
      )
    );

    res.json({
      summary: {
        totalAppointments,
        totalRevenue: revenue.total,
        paidAppointments: revenue.count,
      },
      barChartData: {
        labels: ranges.map(r => r.name),
        values: counts
      }
    });
  } catch (error) {
    console.error('Doctor Dashboard Error:', error);
    res.status(500).json({ message: 'Failed to load doctor dashboard' });
  }
};
