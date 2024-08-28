document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email("","",""));

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(re, su,  bo) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = re;
  document.querySelector('#compose-subject').value = su;
  document.querySelector('#compose-body').value = bo;

  send_mail();
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  let ärch = "Archive";
   if(mailbox == "archive"){
    ärch = "Unarchive";
  } 


  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    emails.forEach(mail => {
        const div = document.createElement('div');
      if(!mail.read){ //ungelesene Emails ausstellen
          div.innerHTML = `<style> .unread{ background-color: white;}</style>
          <div style="border-style: solid; margin: 10px; border-radius: 25px; padding: 20px;" class="unread" id="${mail.id}"> 
          <h4>${mail.recipients} </h4>
          <h5>${mail.subject}</h5>
          <p>${mail.timestamp}</p>
          </div>`; 
      } else{ //gelesene Emails ausstellen
          div.innerHTML = `<style> .read{ background-color: gray;}</style>
          <div style="border-style: solid; margin: 10px; border-radius: 25px; padding: 20px;" class="read" id="${mail.id}"> 
          <h4>${mail.recipients} </h4>
          <h5>${mail.subject}</h5>
          <p>${mail.timestamp}</p>
          </div>`; 
      }
      document.querySelector('#emails-view').appendChild(div);

      // Einzelne Emails aufrufen
      var temp = mail.id;
      document.getElementById(mail.id).onclick = function(temp){
        document.querySelector('#emails-view').innerHTML = "";

        //email auf read stellen
        fetch('/emails/' + mail.id, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })

        //email anzeigen
        fetch('/emails/' + mail.id)
        .then(response => response.json())
        .then(email => {
          //-------
          console.log("ASBCEASD");
          console.log(email);
          const div = document.createElement('div');
          div.innerHTML= `<h5>Gesendet von: ${mail.sender}</h5>
          <h4 style="text-align: center;">${mail.subject}</h4>
          <div style="display: flex;">
          <input type="button" id="archiveButton" value="${ärch}" style="margin-left: 35%;">
          <input type="button" id="replyButton" value="Reply" style="margin-left: 10px;">
          </div>
          <p style="font-size: 10px; text-align: center;">${mail.timestamp}</p>
          <p>${mail.body}</p>`;
          document.querySelector('#emails-view').appendChild(div);
          //archive button
          document.getElementById("archiveButton").onclick = function(){
            fetch('/emails/' + mail.id, {
              method: 'PUT',
              body: JSON.stringify({
                archived: !mail.archived
              })
            })
          };
          //reply button
          document.getElementById("replyButton").onclick = function(){
            fetch('/emails/' + mail.id)
            .then(response => response.json())
            .then(result => {
              // zu send-mail chicken
              console.log("BUTTON!");
              compose_email(mail.sender, "RE: " + mail.subject,  mail.timestamp + " " + mail.sender + " wrote: " + mail.body);
            });
          };
        });
      }

    });
});
}

function send_mail(){
  document.querySelector('#compose-form').addEventListener('submit', event => {
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: document.getElementById("compose-recipients").value,
          subject: document.getElementById("compose-subject").value,
          body: document.getElementById("compose-body").value,
        }),
      })
      .then(response => response.json())
      .then(result => {
        // Print result
        console.log(result);
      });
      event.preventDefault();
      load_mailbox('sent');
  });
}
