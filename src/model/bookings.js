const db = require("../config/postgre");
const getTimeStamp = require("../helper/getTimeStamp");

const createBooking = (body, userId, paymentId) =>
  new Promise((resolve, reject) => {
    const { movieScheduleId, totalPayment, paymentMethodId } = body;
    const totalSeat = JSON.parse(body.seatIds).length;
    const values = [
      movieScheduleId,
      userId,
      totalPayment,
      paymentMethodId,
      paymentId,
      getTimeStamp(),
      totalSeat,
    ];
    const query =
      "INSERT INTO bookings (movie_schedule_id, user_id, total_payment, payment_method_id, payment_id, created_at, ticket_total) VALUES ($1, $2, $3, $4, $5, to_timestamp($6), $7) returning *";
    db.query(query, values, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve({ status: 201, msg: "Success", data: result.rows[0] });
    });
  });

const createBookingSeat = (seats, bookingId) =>
  new Promise((resolve, reject) => {
    const seatList = JSON.parse(seats);
    const prepareValues = [];
    let values = "VALUES";
    seatList.forEach((seatId, index, array) => {
      if (index !== array.length - 1) {
        values += `($${1 + index * 3}, $${2 + index * 3}, to_timestamp($${
          3 + index * 3
        })), `;
      } else {
        values += `($${1 + index * 3}, $${2 + index * 3}, to_timestamp($${
          3 + index * 3
        }))`;
      }
      prepareValues.push(bookingId, seatId, getTimeStamp());
    });
    const query = `INSERT INTO booking_seats(booking_id, seat_id, created_at) ${values} returning *`;
    console.log(query);
    db.query(query, prepareValues, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve({
        status: 201,
        msg: "Booking Success",
        data: result.rows,
      });
    });
  });
const bookingRepo = { createBooking, createBookingSeat };
module.exports = bookingRepo;