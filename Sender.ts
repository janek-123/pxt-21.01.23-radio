const mySerial = Utility.encodeSerial(control.deviceSerialNumber())
SetUp();

function SetUp() {
    radio.setTransmitPower(5);
    radio.setFrequencyBand(7);
    radio.setTransmitSerialNumber(true);
    radio.setGroup(1);
}

let codeArchive: Data[] = [nData(7, 1)]
function NormalSender() {
    let nextCode = 7
    let nextGrp = 0
    let jumpNext = false
    let confirmed = false;

    input.onButtonPressed(Button.AB, () => { confirmed = false; basic.clearScreen(); })

    input.onButtonPressed(Button.A, () => {
        if (confirmed) { confirmed = false; basic.clearScreen(); return;}
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
        nextGrp = codeArchive[codeArchive.length - 1].grp;

        radio.setGroup(nextGrp);
        Send(nextCode);
    })
    /**/

    // beacon: 
    // <= "7" + serial
    //value = string { newgrp, newcode }, int = serial
    // => <encserial> : <newCode> & "grp" : <group>
    radio.onReceivedValue(function (recStr: string, recNum: number) {
        if (beacon) return
        if (recStr == mySerial) {
            if (recNum == 0) {
                basic.showString("W")
            } else {
                const remoteID = radio.receivedPacket(RadioPacketProperty.SerialNumber);
                nextCode = recNum
                //codeArchive.push({ code: recNum })
                whaleysans.showNumber(recNum)

                console.logValue("Received value", recStr + " : " + recNum + "\n\r");
                console.logValue("Remote ID", remoteID + "\n\r");
                console.logValue("nextCode", nextCode);
            }

        } else if (recStr == "grp") {
            nextGrp = recNum;
            //radio.setGroup(nextGrp);
            codeArchive[codeArchive.length - 1].grp = recNum;
            codeArchive.forEach(code => console.log(code));
            
            console.logValue("Received grp", recNum + "\n\r");
            console.logValue("nextGrp", nextGrp);
        }
    })
}

let dataCreated = false;

function AddDataToCodeArchive(grp : boolean, value ?: number){
    if (!dataCreated) {
        codeArchive.push(null);
        dataCreated = true;
    }    

    if (grp) codeArchive[codeArchive.length - 1].grp = value;
    else codeArchive[codeArchive.length - 1].code = value;
}

function OnFullDataReceived(group : number)
{
    radio.setGroup(group);
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