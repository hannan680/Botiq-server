const Location = require("../../../infrastructure/database/models/location.model");
const GHLAuth = require("../../../core/domain/entities/ghlAuth.entity");
const GHLCalendar = require("../../../core/domain/entities/ghlCalendar.entity");
const GHLCustomValue = require("../../../core/domain/entities/ghlCustomValue.entity");

const { AppError, catchAsync } = require("../../../core/utils/errorHandler");

const ghlAuth = new GHLAuth(Location);
const ghlCalendar = new GHLCalendar(ghlAuth);
const ghlCustomValue = new GHLCustomValue(ghlAuth);

exports.getCalendars = catchAsync(async (req, res, next) => {
  const { locationId } = req.query;
  console.log(locationId);
  // Validate locationId
  if (!locationId) {
    throw new AppError("Location ID is required", 400);
  }

  // Fetch calendars
  const fullCalendars = await ghlCalendar.getCalendars(locationId);
  // Extract simplified calendars
  const simplifiedCalendars = fullCalendars.calendars.map((calendar) => ({
    id: calendar.id,
    name: calendar.name,
  }));
  console.log(simplifiedCalendars);

  // Fetch custom values
  const { customValues } = await ghlCustomValue.getCustomValues(locationId);
  // Find custom value for 'Calendar ID'
  console.log(customValues);
  const calendarCustomValue = customValues.find(
    (customValue) => customValue.name === "Calendar ID"
  );

  // Initialize selectedCalendar as null
  let selectedCalendar = null;
  console.log("heloo", calendarCustomValue);
  if (calendarCustomValue) {
    // Check if the custom value exists in the list of calendars
    selectedCalendar = simplifiedCalendars.find(
      (calendar) => calendar.id === calendarCustomValue.value
    );
  }

  // Send response
  res.status(200).json({
    status: "success",
    calendars: simplifiedCalendars,
    selectedCalendar: selectedCalendar || null, // If no match, return null
    traceId: fullCalendars.traceId,
  });
});
