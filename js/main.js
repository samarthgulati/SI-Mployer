 $(document).ready(function() {
     var url = 'https://spreadsheets.google.com/feeds/list/1j17ANt3kBna-uU4CiQ0Tbcx7esPVzJ_YAy5x1C9pazY/1/public/basic?alt=json';
     $.get(url, function(json, status) {
         var input = json.feed.entry;
         var columns = ['companyname', 'jobtitle-careerpathway', 'salary', 'state', 'industry', 'year'];
         var data = [];
         for (var i in input) {
             var row = {};
             for (var j = 0; j < columns.length; j++) {
                 if (j != columns.length - 1) {
                     row[columns[j]] = input[i].content.$t.split(columns[j] + ': ')[1];
                     row[columns[j]] = row[columns[j]].split(', ' + columns[j + 1] + ': ')[0];
                 } else {
                     row[columns[j]] = input[i].content.$t.split(columns[j] + ': ')[1];
                 }
             }
             data.push(row);
         }
         for (var m in columns) {
             $('thead>tr').append('<th>' + columns[m] + '</th>');
         }
         for (var k in data) {
             $('tbody').append('<tr class="' + k + '"></tr>');
             for (var l in data[k]) {
                 $('tr.' + k).append('<td>' + data[k][l] + '</td>');
             }
         }
     });
 });
