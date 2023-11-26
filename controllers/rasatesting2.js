const db1 = require("../routes/rasa-db");

const rasatesting2 = async (req, res) => {
  const { full_name, event_name, event_description, event_day, start_time, end_time, user_id, contact_number, authenticated, requestor_information, requestor_type, participants, purpose_objectives, required_day, endorsed } = req.body;

  console.log("----------------------------------------");
  console.log("rasatesting2.js");
  console.log(event_day);
  console.log(start_time);
  console.log(end_time);
  console.log(user_id);
  console.log("----------------------------------------");
  console.log("");
  console.log("");
  console.log("");

  const eventDate = new Date(event_day);
  eventDate.setDate(eventDate.getDate() + Number(required_day));
  const end_date = eventDate.toISOString().split("T")[0];

  try {
    const overlappingEvents = await new Promise((resolve, reject) => {
      db1.query(
        'SELECT * FROM calendar_input WHERE event_day = ? AND ' +
        '((CAST(? AS TIME) >= start_time AND CAST(? AS TIME) < end_time) ' +
        'OR (CAST(? AS TIME) > start_time AND CAST(? AS TIME) <= end_time) ' +
        'OR (CAST(? AS TIME) <= start_time AND CAST(? AS TIME) >= end_time))',
        [event_day, start_time, start_time, end_time, end_time, start_time, end_time],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            console.log("Overlapping events in calendar_input:", results);

            // If there are overlapping events, return an error
            if (results.length > 0) {
              console.log("Overlapping events found. Aborting insertion.");
              res.status(400).json({ status: 'aborted', error: 'Overlapping event found in calendar_table. Please choose a different time.' });
              return;
            }

            // No overlapping events, proceed with insertion
            db1.query('INSERT INTO inputted_table SET ?', {
              full_name: full_name,
              user_id: user_id,
              event_name: event_name,
              event_description: event_description,
              event_day: event_day,
              start_time: start_time,
              end_date: end_date,
              end_time: end_time,
              contact_number: contact_number,
              requestor_information: requestor_information,
              requestor_type: requestor_type,
              endorsed: endorsed,
              participants: participants,
              purpose_objectives: purpose_objectives,
              required_day: required_day,
              rasa_status: "Pending",
              authenticated: authenticated,
            }, (error, results) => {
              if (error) {
                console.error(error);
                res.status(500).json({ status: 'error', error: 'Error inserting data into inputted_table.' });
              } else {
                const insertedId = results.insertId;
                console.log(insertedId + "rasatesting2.js line 70");
                res.json({
                  status: "success",
                  id: insertedId,
                  success: "Rasatesting 2 is successfully done"
                });
              }
            });
          }
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', error: 'Internal server error.' });
  }
};

module.exports = rasatesting2;