  const togglePassword = document.querySelector('#togglePassword');
  const password = document.querySelector('#InputPasswordLogin');
  const myInput1 = document.querySelector('#InputEmailLogin');
  const myInput2 = document.querySelector('#InputPasswordLogin');
  const noUserLabel = document.querySelector('#no-user-label');

  togglePassword.addEventListener('click', function (e) {
    // toggle the type attribute
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    // toggle the eye slash icon
    this.classList.toggle('fa-eye-slash');
  });

  myInput1.onblur = function() {
    noUserLabel.style.display = "none";
  }

  myInput2.onblur = function() {
    noUserLabel.style.display = "none";
  }
