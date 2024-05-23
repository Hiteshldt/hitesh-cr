// Selecing each menu of sidebar

const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item=> {
	const li = item.parentElement;

	item.addEventListener('click', function () {
		allSideMenu.forEach(i=> {
			i.parentElement.classList.remove('active');
      
		})
		li.classList.add('active');
    sidebar.classList.toggle('hide');
    
	})
});

// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

sidebar.classList.add('hide');

menuBar.addEventListener('click', function () {
    sidebar.classList.toggle('hide');
});

//Toggle elements in the sidebar

function showPage(page) {
    // List of all pages
    const pages = ['Dashboard-Page', 'Profile-Page', 'Aboutus-Page'];
    // Hide all pages
    pages.forEach(p => {
      document.querySelector('.' + p).style.display = 'none';
    });
    // Show the selected page
    document.querySelector('.' + page).style.display = 'block';
  }
  
  // Select buttons and add event listeners
  const dashboardItem = document.querySelector('.dashboardbtn');
  const profileItem = document.querySelector('.profilebtn');
  const aboutUsItem = document.querySelector('.aboutusbtn');
  
  dashboardItem.addEventListener('click', () => showPage('Dashboard-Page'));
  profileItem.addEventListener('click', () => showPage('Profile-Page'));
  aboutUsItem.addEventListener('click', () => showPage('Aboutus-Page'));
  
  // Initialize the default page
  showPage('Dashboard-Page'); // By default, the Dashboard page is shown
  
//Charts:
const ctx = document.getElementById('myChart');

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['10:00', '10:04', '10:08', '10:12', '10:16', '10:20', '10:24', '10:28', '10:32', '10:36', '10:40', '10:44', '10:48', '10:52', '10:56', '11:00'],
    datasets: [{
      label: 'Temp',
      data: [30.5, 31.5, 68.0, 24.0, 55.8, 31.2, 30.5, 31.0, 31.7, 31.1, 30.2, 45.9, 35.3, 31.4, 30.6],
      borderWidth: 1.5,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 0.9,
    scales: {
      x: {
            ticks: {
                font: {
                    size: 14,
                    fontStyle: 'bold',
                }
            },
            title: {
                display: true,
                text: 'Time',
                font: {
                    size: 16,
                    fontStyle:'bold'
                }
            },
          },
      y: {
            ticks: {
                //Select the max number of values to show
                maxTicksLimit: 15,
                font: {
                    size: 14
                },
            },
            title: {
                display: true,
                text: 'Temperature',
                font: {
                    size: 16,
                    fontStyle:'bold'
                }
            }
      }
    }
  }
  
});

function toggleEditMode(edit) {
  // Toggle the display of buttons
  document.getElementById('edit-button').classList.toggle('hidden', edit);
  document.getElementById('save-button').classList.toggle('visible', edit);
  document.getElementById('back-button').classList.toggle('visible', edit);

  // Toggle the disabled state of inputs
  var inputs = document.querySelectorAll('.profile-container input:not(#email)');
  inputs.forEach(function(input) {
    input.disabled = !edit;
  });

  // Toggle visibility of password fields
  document.getElementById('password').classList.toggle('visible', edit);
  document.getElementById('confirm-password').classList.toggle('visible', edit);
}

function saveProfile() {
  // Implement save functionality here
  toggleEditMode(false);
}

function backToProfile() {
  // Implement back functionality here
  toggleEditMode(false);
}

//Logout
