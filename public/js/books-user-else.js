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
            <td>`+result.bookName+`</td>
            <td>`+result.author+`</td>
            <td>`+((result.availability === 0) ? "No" : "YES") + `</td>
            <td>`+result.availableOn+`</td>
          </tr>`;
        });

        html += `
        <tr>
          <td></td>
          <td id="bookName_data"></td>
          <td id="author_data"></td>
          <td id="availability_data"></td>
          <td id="availableOn_data"></td>
        </tr>`;

        results_body.innerHTML = html;

      }
    };

    request.send();

  }
