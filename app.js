const prompt = require('prompt-sync')();
const fs = require('fs');
const crypto = require('crypto');


class Vault {
    constructor() {
       this.tab = [];
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

    viewPassword() {
        console.log("Twoje hasła:");
        if (this.tab.length === 0) {
            console.log('Brak zapisanych haseł.');
            return;
        }
        this.tab.forEach((haslo, index) => {
            console.log(`${index + 1}- ${haslo}`);
        });
        console.log("")
    }

    dodawanieHasla(haslo) {
        this.tab.push(haslo);
        console.log('Hasło dodane do menedżera.');
    }

    saveFile(filename = 'menadzer.json') {
        const data = {
            key: this.key,
            salt: this.salt,
            hasla: this.tab
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
                   this.tab = data.hasla || [];
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
        let masterPassword = prompt('Ustaw hasło główne: ');
        while(!isNaN(masterPassword)){
           masterPassword = prompt('Ustaw hasło główne: ');
        }
        const { key, salt } = vault.generateKey(masterPassword);
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
        console.log('1. Wyświetl dane');
        console.log('2. Dodaj haslo do menadżera');
        console.log('3. Wyjście');

        let option = prompt('Wybierz opcje: ');
        
        switch(option){
            case '1':
                vault.viewPassword()
                break;
            case '2':
                let haslo = prompt('Podaj hasło do dodania: ');
                while(!isNaN(haslo)){
                    haslo = prompt('Podaj hasło do dodania: ');
                }
                vault.dodawanieHasla(haslo);
                vault.saveFile();
                break;
            case '3':
                console.log('Wyjście z programu.');
                return;
            default:
                console.log('Nieprawidłowa opcja. Spróbuj ponownie.');
        }
    }
   
}main();