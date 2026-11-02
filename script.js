const pollModal = document.getElementById("poll-modal");
const pollForm = document.getElementById("poll-form");
const pollContainer = document.getElementById("poll-container");

const openButtons = [
  document.getElementById("open-poll-modal"),
  document.getElementById("open-create-modal"),
];

const closeButton = document.getElementById("close-poll-modal");
const addOptionButton = document.getElementById("add-option-btn");
const answerOptions = document.getElementById("answer-options");

const totalPollsDisplay = document.getElementById("total-polls");
const totalVotesDisplay = document.getElementById("total-votes");

const pollDurationInput = document.getElementById("poll-duration");

/* MODAL */

openButtons.forEach((button) => {
  if (!button) return;

  button.addEventListener("click", () => {
    pollModal.showModal();
  });
});

closeButton.addEventListener("click", () => {
  pollModal.close();
});

pollModal.addEventListener("click", (event) => {
  if (event.target === pollModal) {
    pollModal.close();
  }
});

/* ADD ANSWER OPTIONS */

addOptionButton.addEventListener("click", () => {
  const currentOptions = answerOptions.querySelectorAll(".answer-input");

  if (currentOptions.length >= 6) {
    alert("You can add a maximum of 6 options.");
    return;
  }

  const newInput = document.createElement("input");

  newInput.type = "text";
  newInput.className = "answer-input";
  newInput.placeholder = `Option ${currentOptions.length + 1}`;
  newInput.required = true;

  answerOptions.appendChild(newInput);
});

/* POLL DATA */

let polls = [];

const DEFAULT_DURATION = 24;

const SIMULATION_MIN_DELAY = 500;
const SIMULATION_MAX_DELAY = 2000;

/* UPDATE STATISTICS */

function updateStatistics() {
  const totalVotes = polls.reduce((total, poll) => {
    return total + poll.simulatedVotes;
  }, 0);

  totalPollsDisplay.textContent = polls.length;

  totalVotesDisplay.textContent = totalVotes.toLocaleString();
}

/* UPDATE POLL STATUS */

function updatePollStatus(poll) {
  const statusElement = poll.card.querySelector(".poll-status");

  if (poll.expired) {
    statusElement.textContent = "● Expired";
    statusElement.dataset.status = "expired";
    return;
  }

  statusElement.textContent =
    poll.simulationStatus === "active"
      ? "● Active"
      : poll.simulationStatus === "paused"
        ? "● Paused"
        : "● Ended";

  statusElement.dataset.status = poll.simulationStatus;
}

/* UPDATE SIMULATION CONTROLS */

function updateSimulationControls(poll) {
  const pauseButton = poll.card.querySelector(".pause-simulation");
  const resumeButton = poll.card.querySelector(".resume-simulation");
  const endButton = poll.card.querySelector(".end-simulation");

  const disabled = poll.expired || poll.simulationStatus === "ended";

  pauseButton.disabled = disabled || poll.simulationStatus === "paused";

  resumeButton.disabled = disabled || poll.simulationStatus === "active";

  endButton.disabled = disabled;
}

/* CREATE POLL CARD */

function createPollCard(poll) {
  const card = document.createElement("article");

  card.className = "poll-card";
  card.dataset.category = poll.category;
  card.dataset.pollId = poll.id;

  const top = document.createElement("div");
  top.className = "poll-card-top";

  const category = document.createElement("span");
  category.className = "poll-category";
  category.textContent = poll.category;

  const status = document.createElement("span");
  status.className = "poll-status";

  top.append(category, status);

  const heading = document.createElement("h3");
  heading.textContent = poll.question;

  const optionsContainer = document.createElement("div");
  optionsContainer.className = "poll-options";

  poll.options.forEach((option) => {
    const optionRow = document.createElement("div");
    optionRow.className = "poll-option";

    const optionName = document.createElement("span");
    optionName.textContent = option;

    const percentage = document.createElement("span");
    percentage.textContent = "0%";

    const track = document.createElement("div");
    track.className = "progress-track";

    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = "0%";

    track.appendChild(fill);

    optionRow.append(optionName, percentage);

    optionsContainer.append(optionRow, track);
  });

  const footer = document.createElement("div");
  footer.className = "poll-card-footer";

  const voteCount = document.createElement("span");
  voteCount.className = "vote-count";
  voteCount.textContent = "0 demo votes";

  const voteButton = document.createElement("button");
  voteButton.className = "vote-btn";
  voteButton.textContent = "Vote Now →";

  footer.append(voteCount, voteButton);

  /* SIMULATION CONTROLS */

  const controls = document.createElement("div");
  controls.className = "simulation-controls";

  const pauseButton = document.createElement("button");
  pauseButton.className = "pause-simulation";
  pauseButton.textContent = "Pause";

  const resumeButton = document.createElement("button");
  resumeButton.className = "resume-simulation";
  resumeButton.textContent = "Resume";

  const endButton = document.createElement("button");
  endButton.className = "end-simulation";
  endButton.textContent = "End";

  controls.append(pauseButton, resumeButton, endButton);

  /* EXPIRATION COUNTDOWN */

  const expirationContainer = document.createElement("div");
  expirationContainer.className = "poll-expiration";

  const expirationLabel = document.createElement("span");
  expirationLabel.textContent = "Expires in";

  const expirationTime = document.createElement("span");
  expirationTime.className = "expiration-countdown";

  expirationContainer.append(expirationLabel, expirationTime);

  card.append(
    top,
    heading,
    optionsContainer,
    footer,
    controls,
    expirationContainer,
  );

  pollContainer.prepend(card);

  poll.card = card;
  poll.voteCountElement = voteCount;
  poll.expirationElement = expirationTime;

  /* INDIVIDUAL CONTROL EVENTS */

  pauseButton.addEventListener("click", () => {
    pauseVoteSimulation(poll);
  });

  resumeButton.addEventListener("click", () => {
    resumeVoteSimulation(poll);
  });

  endButton.addEventListener("click", () => {
    endVoteSimulation(poll);
  });

  updatePollStatus(poll);
  updateSimulationControls(poll);
}

/* START DEMO VOTE SIMULATION */

function startVoteSimulation(poll) {
  if (poll.expired || poll.simulationStatus !== "active") {
    return;
  }

  clearTimeout(poll.simulationTimer);

  function simulateVotes() {
    if (poll.expired || poll.simulationStatus !== "active") {
      return;
    }

    const increase = Math.floor(Math.random() * 11) + 5;

    poll.simulatedVotes += increase;

    const randomOption = Math.floor(Math.random() * poll.optionVotes.length);

    poll.optionVotes[randomOption] += increase;

    updatePollResults(poll);
    updateStatistics();

    poll.voteCountElement.textContent = `${poll.simulatedVotes.toLocaleString()} demo votes`;

    const nextInterval =
      Math.floor(
        Math.random() * (SIMULATION_MAX_DELAY - SIMULATION_MIN_DELAY + 1),
      ) + SIMULATION_MIN_DELAY;

    poll.simulationTimer = setTimeout(simulateVotes, nextInterval);
  }

  const firstInterval = Math.floor(Math.random() * 2000) + 1000;

  poll.simulationTimer = setTimeout(simulateVotes, firstInterval);
}

/* PAUSE DEMO VOTES */

function pauseVoteSimulation(poll) {
  if (poll.expired || poll.simulationStatus !== "active") {
    return;
  }

  clearTimeout(poll.simulationTimer);

  poll.simulationTimer = null;
  poll.simulationStatus = "paused";

  updatePollStatus(poll);
  updateSimulationControls(poll);
}

/* RESUME DEMO VOTES */

function resumeVoteSimulation(poll) {
  if (poll.expired || poll.simulationStatus !== "paused") {
    return;
  }

  poll.simulationStatus = "active";

  updatePollStatus(poll);
  updateSimulationControls(poll);

  startVoteSimulation(poll);
}

/* END DEMO VOTES */

function endVoteSimulation(poll) {
  clearTimeout(poll.simulationTimer);
  clearInterval(poll.expirationTimer);

  poll.expired = true;
  poll.simulationStatus = "ended";

  poll.card.remove();

  polls = polls.filter((item) => item.id !== poll.id);

  updateStatistics();
}

/* UPDATE POLL RESULTS */

function updatePollResults(poll) {
  const total = poll.optionVotes.reduce((sum, votes) => {
    return sum + votes;
  }, 0);

  const rows = poll.card.querySelectorAll(".poll-option");
  const tracks = poll.card.querySelectorAll(".progress-fill");

  rows.forEach((row, index) => {
    const percentage =
      total === 0 ? 0 : Math.round((poll.optionVotes[index] / total) * 100);

    row.children[1].textContent = `${percentage}%`;

    tracks[index].style.width = `${percentage}%`;
  });
}

/* FORMAT COUNTDOWN */

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

/* EXPIRE POLL */

function expirePoll(poll) {
  if (poll.expired) return;

  poll.expired = true;

  clearTimeout(poll.simulationTimer);
  clearInterval(poll.expirationTimer);

  poll.simulationTimer = null;
  poll.expirationTimer = null;

  poll.expirationElement.textContent = "Expired";

  const voteButton = poll.card.querySelector(".vote-btn");

  voteButton.disabled = true;
  voteButton.textContent = "Poll Expired";

  updatePollStatus(poll);
  updateSimulationControls(poll);

  const controls = poll.card.querySelector(".simulation-controls");

  controls.innerHTML = `
  <button type="button" class="remove-poll-btn">
    Remove Poll
  </button>
`;

  controls.querySelector(".remove-poll-btn").addEventListener("click", () => {
    poll.card.remove();

    polls = polls.filter((item) => item.id !== poll.id);

    updateStatistics();
  });
}

/* UPDATE EXPIRATION COUNTDOWN */

function updateExpirationCountdown(poll) {
  const remaining = poll.expiresAt - Date.now();

  if (remaining <= 0) {
    expirePoll(poll);
    return;
  }

  poll.expirationElement.textContent = formatCountdown(remaining);
}

/* START EXPIRATION TIMER */

function startExpirationTimer(poll) {
  updateExpirationCountdown(poll);

  if (poll.expired) return;

  poll.expirationTimer = setInterval(() => {
    updateExpirationCountdown(poll);
  }, 1000);
}

/* SUBMIT NEW POLL */

pollForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const question = document.getElementById("poll-question").value.trim();

  const category = document.getElementById("poll-category").value;

  const options = Array.from(
    answerOptions.querySelectorAll(".answer-input"),
  ).map((input) => input.value.trim());

  if (!question || !category || options.length < 2) {
    alert("Please complete all poll fields.");
    return;
  }

  if (options.some((option) => !option)) {
    alert("Please fill in every answer option.");
    return;
  }

  if (
    new Set(options.map((option) => option.toLowerCase())).size !==
    options.length
  ) {
    alert("Please remove duplicate answer options.");
    return;
  }

const duration = Number(pollDurationInput?.value || 86400);

  if (!Number.isFinite(duration) || duration <= 0) {
    alert("Please select a valid poll duration.");
    return;
  }

  const poll = {
    id: crypto.randomUUID(),
    question,
    category,
    options,
    simulatedVotes: 0,
    optionVotes: options.map(() => 0),
    simulationStatus: "active",
    simulationTimer: null,
    expirationTimer: null,
    expiresAt: Date.now() + duration * 1000,
    expired: false,
  };

  polls.push(poll);

  createPollCard(poll);

  startVoteSimulation(poll);
  startExpirationTimer(poll);

  updateStatistics();

  pollForm.reset();

  answerOptions.innerHTML = `
    <input type="text" class="answer-input" placeholder="Option 1" required>
    <input type="text" class="answer-input" placeholder="Option 2" required>
  `;

  pollModal.close();

  document.getElementById("explore").scrollIntoView({
    behavior: "smooth",
  });
});

/* INITIAL SAMPLE POLLS */

document.querySelectorAll(".poll-card").forEach((card) => {
  const voteElement = card.querySelector(".vote-count");

  const initialVotes = Number(voteElement.dataset.votes) || 0;

  const optionRows = card.querySelectorAll(".poll-option");

  const optionVotes = Array.from(optionRows).map((row) => {
    const percentage = Number(row.children[1].textContent.replace("%", ""));

    return Math.round((initialVotes * percentage) / 100);
  });

  const options = Array.from(optionRows).map((row) => {
    return row.children[0].textContent;
  });

  const poll = {
    id: crypto.randomUUID(),
    question: card.querySelector("h3").textContent,
    category: card.dataset.category || "general",
    options,
    simulatedVotes: initialVotes,
    optionVotes,
    card,
    voteCountElement: voteElement,
    expirationElement: null,
    simulationStatus: "active",
    simulationTimer: null,
    expirationTimer: null,
    expiresAt: Date.now() + DEFAULT_DURATION * 60 * 60 * 1000,
    expired: false,
  };

  const expirationContainer = document.createElement("div");
  expirationContainer.className = "poll-expiration";

  const expirationLabel = document.createElement("span");
  expirationLabel.textContent = "Expires in";

  const expirationTime = document.createElement("span");
  expirationTime.className = "expiration-countdown";

  expirationContainer.append(expirationLabel, expirationTime);

  const controls = document.createElement("div");
  controls.className = "simulation-controls";

  const pauseButton = document.createElement("button");
  pauseButton.className = "pause-simulation";
  pauseButton.textContent = "Pause";

  const resumeButton = document.createElement("button");
  resumeButton.className = "resume-simulation";
  resumeButton.textContent = "Resume";

  const endButton = document.createElement("button");
  endButton.className = "end-simulation";
  endButton.textContent = "End";

  controls.append(pauseButton, resumeButton, endButton);

  card.append(controls, expirationContainer);

  poll.expirationElement = expirationTime;

  pauseButton.addEventListener("click", () => {
    pauseVoteSimulation(poll);
  });

  resumeButton.addEventListener("click", () => {
    resumeVoteSimulation(poll);
  });

  endButton.addEventListener("click", () => {
    endVoteSimulation(poll);
  });

  polls.push(poll);

  updatePollStatus(poll);
  updateSimulationControls(poll);

  startVoteSimulation(poll);
  startExpirationTimer(poll);
});

/* CATEGORY FILTERING */

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    const selectedCategory = button.dataset.filter;

    document.querySelectorAll(".poll-card").forEach((card) => {
      const matches =
        selectedCategory === "all" ||
        card.dataset.category === selectedCategory;

      card.style.display = matches ? "" : "none";
    });
  });
});

/* INITIAL STATISTICS */

updateStatistics();
