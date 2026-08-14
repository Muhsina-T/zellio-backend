const Order = require("../models/Order");

const getWeeklyAnalytics = async (req, res) => {
  try {
    const now = new Date();

    // Start of 7 days ago
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 6);

    // End of today
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    const analytics = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $unwind: {
          path: "$items",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          itemRevenue: {
            $multiply: [
              {
                $ifNull: [
                  "$items.sellingPrice",
                  0,
                ],
              },
              {
                $ifNull: [
                  "$items.quantity",
                  0,
                ],
              },
            ],
          },

          itemProfit: {
            $multiply: [
              {
                $subtract: [
                  {
                    $ifNull: [
                      "$items.sellingPrice",
                      0,
                    ],
                  },
                  {
                    $ifNull: [
                      "$items.costPrice",
                      0,
                    ],
                  },
                ],
              },
              {
                $ifNull: [
                  "$items.quantity",
                  0,
                ],
              },
            ],
          },
        },
      },

      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
            day: {
              $dayOfMonth: "$createdAt",
            },
          },

          revenue: {
            $sum: "$itemRevenue",
          },

          profit: {
            $sum: "$itemProfit",
          },

          orderIds: {
            $addToSet: "$_id",
          },
        },
      },

      {
        $project: {
          _id: 0,

          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },

          revenue: 1,
          profit: 1,

          orders: {
            $size: "$orderIds",
          },
        },
      },

      {
        $sort: {
          date: 1,
        },
      },
    ]);

    // Create all 7 days, including days with zero sales
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const existing = analytics.find(
        (item) => {
          const itemDate = new Date(
            item.date
          );

          return (
            itemDate.getFullYear() ===
              date.getFullYear() &&
            itemDate.getMonth() ===
              date.getMonth() &&
            itemDate.getDate() ===
              date.getDate()
          );
        }
      );

      result.push({
        date: date.toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
          }
        ),

        revenue: existing
          ? Number(existing.revenue || 0)
          : 0,

        profit: existing
          ? Number(existing.profit || 0)
          : 0,

        orders: existing
          ? Number(existing.orders || 0)
          : 0,
      });
    }

    res.json(result);
  } catch (error) {
    console.error(
      "Weekly analytics error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch weekly analytics",
      error: error.message,
    });
  }
};


const getDailyAnalytics = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    const startDate = new Date(`${date}T00:00:00`);
    const endDate = new Date(`${date}T23:59:59.999`);

    const orders = await Order.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const revenue = orders.reduce(
      (sum, order) =>
        sum + Number(order.total || 0),
      0
    );

    const profit = orders.reduce(
      (orderProfit, order) => {
        const orderItemProfit = (order.items || []).reduce(
          (itemProfit, item) => {
            const sellingPrice = Number(
              item.sellingPrice || 0
            );

            const costPrice = Number(
              item.costPrice || 0
            );

            const quantity = Number(
              item.quantity || 0
            );

            return (
              itemProfit +
              (sellingPrice - costPrice) * quantity
            );
          },
          0
        );

        return orderProfit + orderItemProfit;
      },
      0
    );

    res.json({
      date,
      orders: orders.length,
      revenue,
      profit,
    });
  } catch (error) {
    console.error(
      "Daily analytics error:",
      error
    );

    res.status(500).json({
      message: "Failed to calculate daily analytics",
    });
  }
};



module.exports = {
  getWeeklyAnalytics,
  getDailyAnalytics,
};