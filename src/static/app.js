document.addEventListener("DOMContentLoaded", () => {
  const activitiesListEl = document.getElementById('activities-list');
  const activitySelectEl = document.getElementById('activity');
  const signupForm = document.getElementById('signup-form');
  const messageEl = document.getElementById('message');

  // Function to fetch activities from API
  async function fetchActivities() {
    const res = await fetch('/activities');
    if (!res.ok) throw new Error('Failed to load activities');
    return await res.json();
  }

  function showMessage(text, type = 'info') {
    messageEl.className = '';
    messageEl.classList.add('message', type);
    messageEl.textContent = text;
    messageEl.classList.remove('hidden');
    setTimeout(() => messageEl.classList.add('hidden'), 4000);
  }

  function renderActivities(activities) {
    activitiesListEl.innerHTML = '';
    activitySelectEl.innerHTML = '<option value="">-- Select an activity --</option>';

    const names = Object.keys(activities);
    if (names.length === 0) {
      activitiesListEl.innerHTML = '<p class="no-participants">No activities available.</p>';
      return;
    }

    names.forEach(name => {
      const a = activities[name];
      // populate select
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      activitySelectEl.appendChild(opt);

      // build card
      const card = document.createElement('div');
      card.className = 'activity-card';

      const title = document.createElement('h4');
      title.textContent = name;
      card.appendChild(title);

      const desc = document.createElement('p');
      desc.textContent = a.description;
      card.appendChild(desc);

      const sched = document.createElement('p');
      sched.innerHTML = `<strong>Schedule:</strong> ${a.schedule}`;
      card.appendChild(sched);

      // participants section
      const partSection = document.createElement('div');
      partSection.className = 'participants-section';

      const partTitle = document.createElement('div');
      partTitle.className = 'participants-title';
      const countSpan = document.createElement('span');
      countSpan.className = 'participants-count';
      countSpan.textContent = a.participants.length;
      partTitle.innerHTML = `<span>Participants</span>`;
      partTitle.prepend(countSpan);
      partSection.appendChild(partTitle);

      if (a.participants.length === 0) {
        const none = document.createElement('div');
        none.className = 'no-participants';
        none.textContent = 'No participants yet.';
        partSection.appendChild(none);
      } else {
        const ul = document.createElement('ul');
        ul.className = 'participants-list';
        a.participants.forEach(email => {
          const li = document.createElement('li');
          const badge = document.createElement('span');
          badge.className = 'participant-badge';
          badge.textContent = email.split('@')[0]; // show short name in badge
          li.appendChild(badge);
          const txt = document.createTextNode(' ' + email);
          li.appendChild(txt);
          ul.appendChild(li);
        });
        partSection.appendChild(ul);
      }

      card.appendChild(partSection);
      activitiesListEl.appendChild(card);
    });
  }

  async function loadAndRender() {
    try {
      const activities = await fetchActivities();
      renderActivities(activities);
    } catch (err) {
      activitiesListEl.innerHTML = '<p class="error">Unable to load activities.</p>';
      console.error(err);
    }
  }

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const activity = document.getElementById('activity').value;
    if (!email || !activity) {
      showMessage('Please provide email and select an activity.', 'error');
      return;
    }

    try {
      const url = `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`;
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Signup failed' }));
        throw new Error(err.detail || 'Signup failed');
      }
      const data = await res.json();
      showMessage(data.message, 'success');
      // refresh UI
      await loadAndRender();
      signupForm.reset();
    } catch (err) {
      showMessage(err.message || 'Signup error', 'error');
    }
  });

  // initial load
  loadAndRender();
});
