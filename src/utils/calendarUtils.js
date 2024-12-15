export const addToCalendar = (opportunity) => {
  const { title, deadline, university } = opportunity;
  
  // Parse the deadline string
  const deadlineDate = parseDeadline(deadline);
  if (!deadlineDate) return;
  
  // Create calendar event URL
  const eventTitle = encodeURIComponent(`PhD Application Deadline: ${title}`);
  const details = encodeURIComponent(`PhD Opportunity at ${university}\n\nApplication Deadline`);
  const dates = deadlineDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
  
  // Google Calendar URL
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${details}&dates=${dates}/${dates}`;
  
  // Open calendar in new window
  window.open(googleUrl, '_blank');
};

// Helper function to parse deadline string
const parseDeadline = (deadline) => {
  if (!deadline) return null;

  // Try parsing different date formats
  const formats = [
    // Format: "10 January 2025"
    (str) => {
      const [day, month, year] = str.split(' ');
      return new Date(`${month} ${day}, ${year}`);
    },
    // Format: "2025-01-10"
    (str) => new Date(str),
    // Format: "10/01/2025"
    (str) => {
      const [day, month, year] = str.split('/');
      return new Date(`${year}-${month}-${day}`);
    }
  ];

  for (const format of formats) {
    try {
      const date = format(deadline);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      continue;
    }
  }

  return null;
};

export const formatDeadline = (deadline) => {
  if (!deadline) return 'Deadline not specified';
  
  const date = parseDeadline(deadline);
  if (!date) return deadline; // Return original string if parsing fails
  
  try {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return deadline; // Return original string if formatting fails
  }
};
