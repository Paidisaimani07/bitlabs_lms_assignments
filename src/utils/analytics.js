const track = (feature, userId) => {
  //const today = new Date().toISOString().slice(0, 10);
  fetch(`${API_BASE}/api/analytics/event`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      feature,
      
      userId
      //timestamp: today,
    }),
  }).catch(() => {});
};
 
export default { track };