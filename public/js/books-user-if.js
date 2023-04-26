  const results_body = document.querySelector('#results');

  load_data();

  function load_data(){
    const request = new XMLHttpRequest();

    request.open('get', '/book-list-data');

    let html = '';

    request.onreadystatechange = () => {
      if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {

        const results = JSON.parse(request.responseText);

        results.forEach(result => {
          html += `
          <tr>
            <td>`+result.bookID+`</td>
            <td contenteditable="true" onblur="update_data(this, 'bookName', '`+result.bookID+`')">`+result.bookName+`</td>
            <td contenteditable="true" onblur="update_data(this, 'author', '`+result.bookID+`')">`+result.author+`</td>
            <td contenteditable="true" onblur="update_data(this, 'availability', '`+result.bookID+`')">`+((result.availability === 0) ? "No" : "YES") + `</td>
            <td contenteditable="true" onblur="update_data(this, 'availableOn', '`+result.bookID+`')">`+result.availableOn+`</td>
            <td> <button type="button" class="btn btn-danger btn-sm" onclick="delete_data(`+result.bookID+`)">Remove</button></td>
          </tr>`;
        });

        html += `
        <tr>
          <td></td>
          <td contenteditable placeholder="New Book Name" id="bookName_data"></td>
          <td contenteditable placeholder="Author of the Book" id="author_data"></td>
          <td contenteditable placeholder="1 for available or 0 if not" id="availability_data"></td>
          <td contenteditable placeholder="If not available available on again:" id="availableOn_data"></td>
          <td><button type="button" class="btn btn-success btn-sm" onclick="add_data()">Add</button></td>
        </tr>`;

        results_body.innerHTML = html;

      }
    };

    request.send();

  }

  function add_data(){

    const book_name = document.getElementById('bookName_data');
    const author_name = document.getElementById('author_data');
    const availability = document.getElementById('availability_data');
    const availableOn = document.getElementById('availableOn_data');

    const param = 'book_name=' + book_name.innerText + '&author_name=' + author_name.innerText + '&availability=' + parseInt(availability.innerText) + '&availableOn=' + availableOn.innerText;

    const request = new XMLHttpRequest();

    if (book_name.innerText!=="" && author_name.innerText!=="" && parseInt(availability.innerText)!==NaN && availableOn.innerText!==""){

      request.open('POST', '/add_data', true);

      request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

      request.onreadystatechange = () => {
        if (request.readyState===XMLHttpRequest.DONE && request.status===200) {

          load_data();

        }
      };

      request.send(param);

    } else {
      alert("Please Add Values To Every Column");
    }

  }

  function update_data(element, variable_name, id){

    const param = `variable_name=` + variable_name + `&variable_value=` + element.innerText + `&id=` + id + '';

    const request = new XMLHttpRequest();

    request.open('POST', '/update_data', true);

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    request.onreadystatechange = () => {

      if (request.readyState===XMLHttpRequest.DONE && request.status===200) {
        alert('Data Updated');
      }
    };

    request.send(param);
  }

  function delete_data(id){

    if (confirm("Are you sure want to remove it?")) {

      const param = `id=` + id + ``;

      const request = new XMLHttpRequest();

      request.open('POST', '/delete_data', true);

      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      request.onreadystatechange = () => {
        if (request.readyState===XMLHttpRequest.DONE && request.status===200) {

          alert("Data Deleted!");

          load_data();

        }
      };

      request.send(param);
    }
  }
