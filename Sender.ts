const mySerial = Utility.encodeSerial(control.deviceSerialNumber())
SetUp();

function SetUp() {
    radio.setTransmitPower(5);
    radio.setFrequencyBand(7);
    radio.setTransmitSerialNumber(true);
    radio.setGroup(1);
}

function Unconfirm() { confirmed = false; basic.clearScreen(); }

let codeArchive: Data[] = [nData(7, 1)];
let confirmed = false;
let nextCode = 7;

function NormalSender() {
    input.onButtonPressed(Button.AB, () => { Unconfirm(); })

    input.onButtonPressed(Button.A, () => {
        if (confirmed) { Unconfirm(); return;}

        receiveData = true;
        Send(nextCode);
    })

    input.onButtonPressed(Button.B, () => {
        if (!confirmed) {
            DisplayQuestionMark();
            confirmed = true;
            return;
        }

        codeArchive.pop();
        nextCode = codeArchive[codeArchive.length - 1].code;
        let nextGrp = codeArchive[codeArchive.length - 1].grp;

        radio.setGroup(nextGrp);
        Send(nextCode);
    })
    /**/

    radio.onReceivedValue(function (recStr: string, recNum: number) {
        if(!receiveData) return;
        
        if (beacon) return;
        console.log("received");
        if (recStr == mySerial) {
            if (recNum == winNum) {
                basic.showString("W");
                basic.pause(10000);
            } else {
                nextCode = recNum
                AddDataToCodeArchive(false, recNum);
                //codeArchive.push({ code: recNum })
                whaleysans.showNumber(recNum);

                console.logValue("Received value", recStr + " : " + recNum + "\n\r");
                console.logValue("nextCode", nextCode);
            }

        } else if (recStr == "grp") {
            AddDataToCodeArchive(true, recNum);
            
            console.logValue("Received grp", recNum + "\n\r");
            console.logValue("nextGrp", recNum);
        }
    })
}

let dataCreated = false;
let receiveData = false;

function AddDataToCodeArchive(grp : boolean, value ?: number){
    if (!dataCreated) {
        codeArchive.push(nData(NaN, NaN));
        dataCreated = true;
    }

    if (grp) codeArchive[codeArchive.length - 1].grp = value;
    else codeArchive[codeArchive.length - 1].code = value;

    let data = codeArchive[codeArchive.length - 1];

    if (dataIsFull(data)){
        OnFullDataReceived(data.grp);
        receiveData = false;
    }
}

function OnFullDataReceived(group : number)
{
    radio.setGroup(group);
    dataCreated = false;
}

function Send(nextCode: number): void { // pičo
    radio.sendNumber(nextCode);
    whaleysans.showNumber(nextCode);
    basic.pause(1000);
    basic.clearScreen();
}

function DisplayQuestionMark(){ basic.showLeds(`
            . # # # .
            . # . # .
            . . . # .
            . . # . .
            . . # . .`);
}