const prompt = require('prompt-sync')();
const fs = require('fs');
const crypto = require('crypto');


class Vault {
    constructor() {
        this.masterPassword = null;
        this.key = null;
        this.salt = null;
    }

    generateKey(password, salt = null) {
        if (!salt) {
            salt = crypto.randomBytes(16);
        } else {
            salt = Buffer.from(salt, 'hex');
        }
    
        const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
        return {
            key: key.toString('hex'),    
            salt: salt.toString('hex')   
        };
    }
    
    verifyPassword(inputPassword) {
        const { key } = this.generateKey(inputPassword, this.salt);
        return key === this.key;
    }

    saveFile(filename = 'menadzer.json') {
        const data = {
            key: this.key,
            salt: this.salt
        };
        fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8');
        console.log('Dane zapisane do pliku.');
    }

   loadFile(filename = 'menadzer.json') {
           try{
               if (fs.existsSync(filename)){
                   const content = fs.readFileSync(filename, 'utf-8');
                   const data = JSON.parse(content);
                   this.key = data.key;
                   this.salt = data.salt;
                   return true;
                  
               }else{
                   console.log(`Plik ${filename} nie istnieje – prosze stworzyc haslo.`);
                   return false;
               }
           }catch(err){
               console.error(' Błąd odczytu pliku:', err);
               return false;
           }
       }
    
  
    
}

function main(){
    
    const vault = new Vault();
    const fileLoaded = vault.loadFile();

    if (!fileLoaded) {
        const masterPassword = prompt('Ustaw hasło główne: ');
        const { key, salt } = vault.generateKey(masterPassword);
        vault.masterPassword = masterPassword;
        vault.key = key;
        vault.salt = salt;
        vault.saveFile();
    }else {
        console.log(' Podaj hasło główne, by uzyskać dostęp:');
        const inputPassword = prompt('Hasło: ');

        if (!vault.verifyPassword(inputPassword)) {
            console.log('Nieprawidłowe hasło. Zamykanie programu.');
            return;
        }

        console.log(' Hasło poprawne. Dostęp przyznany.');
    }
   
   

    while(true){
        let option = prompt('Wybierz opcje: ');
        
        switch(option){
            case '1':
                 
                break;
            case '2':
                console.log('Wyjście z programu.');
                return;
            default:
                console.log('Nieprawidłowa opcja. Spróbuj ponownie.');
        }
    }
   
}main();