document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector("#msg").style.display ="none";
  load_mailbox('inbox');
});

// ----------------------------- COMPOSE EMAIL FUNCTION ------------------------------

function compose_email() {

  // Show compose view and hide other views
  document.querySelector("#msg").style.display ="none";
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector("#show-email").style.display = "none";
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';


  /* found solution after looking on "ED CS50X DISCUSSION"
  thanks to El Bachir ARAQI that suggest to move the button out of the form 
  the function now returns the sent page instead of crash and reload the wole web page shoing the inbox isted of sent*/

  document.querySelector('#submit').addEventListener("click", send_email);
}

//------------------------------- SEND EMAIL FUNCTIOON --------------------------------

function send_email(){
  
  // get the values of the input fields
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  const msg = document.querySelector("#msg");

  // fetch the values in the API
  fetch('/emails',{
    method:'POST',
    body:JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    })
  })
  // load the sent view with the email sent
  .then((response) => response.json())
  .then(result => {
    if(result.error){
      msg.className = "alert-warning text-center p-2 m-2";
      msg.innerHTML = result.error;
      msg.style.display = "block";
      window.scrollTo(0,0)
      console.log(result.error);
    }
    else{
      console.log(result); 
      load_mailbox("sent");
      msg.className = "alert-success text-center p-2 m-2";
      msg.innerHTML = result.message;
      msg.style.display = "block"; 
    }
  })
  return false;
} 

// --------------------------------- LOAD EMAIL FUNCTION -----------------------------------

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector("#msg").style.display ="none";
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector("#show-email").style.display = "none";
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name and headers
  const emailView = document.querySelector('#emails-view')
  emailView.classList.add("row"); 
  emailView.innerHTML = `
  <h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
  <div class="row col-10">
    <span class="col-4"><strong>Address</strong></span>
    <span class="col-3"><strong>Subject</strong></span>
    <span class="col-3"><strong>Date</strong></span>
  </div>`
  
  // get the emails and do for each...
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      //console.log(email)
      
      // Create a div -> give a div classess and id
      const email_div = document.createElement("div");
      email_div.className = "email-div row d-flex";

      // create a inside div
      const inside_div = document.createElement("div")
      inside_div.className= "row col-10"
      inside_div.id = `${email.id};`
      
      // Create the spans
      const address_span = document.createElement("span");
      const subject_span = document.createElement("span");
      const date_span = document.createElement("span");
      const envelope_span =document.createElement("span");
      const archive_span = document.createElement("span");
      
      // Give the spans classes
      address_span.className = "col-4 overflow-hidden";
      subject_span.className = "col-3 overflow-hidden";
      date_span.className = "col-3 overflow-hidden";
      envelope_span.className ="col-1 envelope";
      archive_span.className = "col-1 archive";

      // check if email is read or unread 
      is_read(email, email_div,envelope_span)

      // Give span innerHTML value from emails API
      if (mailbox === 'inbox' || mailbox === "archive"){
        address_span.innerHTML = `${email.sender}`;
        archive_span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-archive" viewBox="0 0 16 16">
        <path d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
        </svg>`
        
      }
      else {
        address_span.innerHTML = `${email.recipients}`;
        archive_span.style.display = "none";       
      }
      
      subject_span.innerHTML = `${email.subject}`;
      date_span.innerHTML = `${email.timestamp}`;
      

      // organize append the values of the spans
      inside_div.append(address_span, subject_span, date_span);
      email_div.append(inside_div, envelope_span, archive_span);
      

      // append them to email view
      emailView.appendChild(email_div);
      
      // add envent listner to the div
      archive_span.addEventListener("click", ()=> archiveEmails(email, mailbox))
      inside_div.addEventListener("click", ()=> showEmail(email.id, mailbox) );
      envelope_span.addEventListener("click", () => read_unread(email, mailbox));
    });
  })
}
// ------------------------------------ EMAIL IS READ FUNCTION ------------------------------

function is_read(email, email_div, envelope){

  // change div back gound and envelope icon if read or unread
  if (!email.read){
    email_div.classList.add("unread");
    envelope.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope" viewBox="0 0 16 16">
    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383l-4.758 2.855L15 11.114v-5.73zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.739zM1 11.114l4.758-2.876L1 5.383v5.73z"/>
  </svg>`;
  }
  else{
    envelope.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope-open" viewBox="0 0 16 16">
    <path d="M8.47 1.318a1 1 0 0 0-.94 0l-6 3.2A1 1 0 0 0 1 5.4v.818l5.724 3.465L8 8.917l1.276.766L15 6.218V5.4a1 1 0 0 0-.53-.882l-6-3.2zM15 7.388l-4.754 2.877L15 13.117v-5.73zm-.035 6.874L8 10.083l-6.965 4.18A1 1 0 0 0 2 15h12a1 1 0 0 0 .965-.738zM1 13.117l4.754-2.852L1 7.387v5.73zM7.059.435a2 2 0 0 1 1.882 0l6 3.2A2 2 0 0 1 16 5.4V14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5.4a2 2 0 0 1 1.059-1.765l6-3.2z"/>
  </svg>`;
  }
}

// ----------------------------------- MARK EMAILS READ UNREAD -------------------------------

function read_unread(email, mailbox){
  if (email.read){
    markasUnread(email.id);
  }
  else{
    markAsRead(email.id);
  }
  
  setTimeout(()=> load_mailbox(mailbox), 50);
  
}

function markAsRead(emailid){

  // mark curret email read status on true
  fetch(`/emails/${emailid}`, {
    method: 'PUT',
    body: JSON.stringify({
        read : true
    })
  })
}

function markasUnread(emailid){

  // mark curren email read status as false
  fetch(`/emails/${emailid}`, {
    method: 'PUT',
    body: JSON.stringify({
        read : false
    })
  })
}

// ----------------------------------- ARCHIVE EMAIL FUNCTION --------------------------------

function archiveEmails(email, mailbox= null){

  // check if email archive status and change it on click
  if (!email.archived){
    fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  }
  else{
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
  }
  if (mailbox){
    setTimeout(()=> load_mailbox(mailbox), 100);
  }
  
}


// --------------------------------- SHOW EMAIL FUNCTION ----------------------------------

function showEmail(emailid, mailbox){

  // seclect the divs and set the display mode
  document.querySelector("#msg").style.display ="none";
  document.querySelector("#emails-view").style.display = "none";
  const showEmail_div = document.querySelector("#show-email")
  showEmail_div.innerHTML = "" 
  showEmail_div.style.display = "block";

  // get the clicked email attribute from json by fetching the API 
  fetch(`/emails/${emailid}`)
    .then(response => response.json())
    .then(email => {
      //console.log(email)
      
      // create div for the sender / recipients
      const address_div = document.createElement("div");
      address_div.className = "address";

      //create a reply button
      const reply_button = document.createElement("button")
      reply_button.className = "btn btn-success reply";
      
      // crate div for archive mail
      const archive_div = document.createElement("div");
      archive_div.className ="archive_div";
      // create div for the subject
      const subject_div = document.createElement("div");
      subject_div.className = "subject";
      
      // create div for the timestamp
      const timestamp_div = document.createElement("div");
      timestamp_div.className = "timestamp";
      
      // crate div for the body of the email
      const body_div = document.createElement("div");
      body_div.className = "email-body";
      //body_div.style.
      
      // instaciate the contents 
      if (mailbox ==="sent"){
        address_div.innerHTML = `Sent to: ${email.recipients}`;
        reply_button.style.display = "none";
        archive_div.style.display ="none";
      }
      else {
        address_div.innerHTML = `From: ${email.sender}`;
        reply_button.innerHTML = "Reply";
        archive_div.innerHTML = "Archive";
      }
      subject_div.innerHTML = `Subject: ${email.subject}`;
      timestamp_div.innerHTML = email.timestamp;
      body_div.innerHTML = email.body.replace(/\n/g,"<br>");

      // create a innerdiv for the header of the email
      const header_div = document.createElement("div")
      header_div.style.position ="relative"
      
      // appens header to the inner div
      header_div.append(address_div,archive_div, reply_button, subject_div, timestamp_div);
      
      // apeend all to the show-email div
      showEmail_div.append(header_div, body_div);

      //mark the email as read
      markAsRead(email.id)
      reply_button.addEventListener("click", () => replyEmail(email))
      archive_div.addEventListener("click", () => archiveEmails(email))
    })
    
// --------------------------------- REPLY EMAIL FUNCTION -----------------------------------

}

function replyEmail(email){
  // replay to current email
  compose_email();

  document.querySelector('#compose-recipients').value = email.sender;
  if (email["subject"].slice(0,4) === "Re: "){
    document.querySelector('#compose-subject').value = email.subject
  }
  else{
    document.querySelector('#compose-subject').value = "Re: " + email.subject;
  }
  
  document.querySelector('#compose-body').value = `
${email.timestamp}
--------------------------------------------------------------

${email.sender}    Wrote:
${email.body}`;

}
