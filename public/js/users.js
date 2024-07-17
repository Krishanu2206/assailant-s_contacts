const deleteuserbtn = document.querySelector("#deleteuserbtn");
const passwordinput = document.querySelector('#passwordinput');
const deleteform = document.querySelector("#deleteform");

deleteuserbtn.addEventListener('click', (e)=>{
    e.preventDefault();
    const password = prompt("Enter password");
    if(!password){
        alert('Password is required to delete the details!');
    }else{
        passwordinput.value = password;
        deleteform.submit();
    }
})