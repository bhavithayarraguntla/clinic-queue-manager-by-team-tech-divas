if ("Notification" in window) {
 Notification.requestPermission();
}
function generateToken() {
 const nameInput = document.getElementById("patientName");
 const typeInput = document.getElementById("visitType");
 if (!nameInput || !typeInput) {
 alert("Input fields not found");
 return;
 }
 const name = nameInput.value;
 const type = typeInput.value;
 if (name === "") {
 alert("Enter patient name");
 return;
 }
 let queue = JSON.parse(localStorage.getItem(type)) || [];
 let token = type.charAt(0).toUpperCase() + (queue.length + 1);
 queue.push({ name, token });
 localStorage.setItem(type, JSON.stringify(queue));
 document.getElementById("statusCard").style.display = "block";
 document.getElementById("tokenNumber").innerText = token;
 document.getElementById("queueType").innerText = type.toUpperCase();
 document.getElementById("patientsAhead").innerText = queue.length - 1;
 document.getElementById("waitTime").innerText = (queue.length - 1) * 10;
}
function loadQueues() {
 loadQueue("emergency", "emergencyList");
 loadQueue("appointment", "appointmentList");
 loadQueue("walkin", "walkinList");
}
function loadQueue(type, elementId) {
 const list = document.getElementById(elementId);
 if (!list) return;
 list.innerHTML = "";
 let queue = JSON.parse(localStorage.getItem(type)) || [];
 queue.forEach((p, index) => {
 const li = document.createElement("li");
 li.innerHTML = `
 ${p.token} - ${p.name}
 <button onclick="markDone('${type}', ${index})">Done</button>
 `;
 list.appendChild(li);
 });
}
function markDone(type, index) {
 let queue = JSON.parse(localStorage.getItem(type)) || [];
 queue.splice(index, 1);
 localStorage.setItem(type, JSON.stringify(queue));
 loadQueues();
}
let currentPatient = null;
function getNextPatient() {
 let emergency = JSON.parse(localStorage.getItem("emergency")) || [];
 let appointment = JSON.parse(localStorage.getItem("appointment")) || [];
 let walkin = JSON.parse(localStorage.getItem("walkin")) || [];
 if (emergency.length > 0) return { type: "emergency", patient: emergency[0] };
 if (appointment.length > 0) return { type: "appointment", patient: appointment[0] };
 if (walkin.length > 0) return { type: "walkin", patient: walkin[0] };
 return null;
}
function startConsultation() {
 const data = getNextPatient();
 const info = document.getElementById("patientInfo");
 if (!data) {
 info.innerText = "No patients waiting";
 return;
 }
 currentPatient = data;
 info.innerText = `Consulting ${data.patient.token} - ${data.patient.name}`;
}
function endConsultation() {
 if (!currentPatient) return;
 let queue = JSON.parse(localStorage.getItem(currentPatient.type)) || [];
 queue.shift();
 localStorage.setItem(currentPatient.type, JSON.stringify(queue));
 const next = getNextPatient();
 if (next) {
 notifyPatient(next.patient);
 }
 document.getElementById("patientInfo").innerText =
 "Consultation completed. Next patient notified.";
 currentPatient = null;
}
function notifyPatient(patient) {
 if (Notification.permission === "granted") {
 new Notification("Clinic Alert ", {
 body: `Hello ${patient.name}, your turn is coming soon. Please be ready.`,
 });
 } else {
 alert(`Hello ${patient.name}, your turn is coming soon.`);
 }
}
window.onload = loadQueues;
