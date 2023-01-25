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
    //let nextGrp = 0
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
        let nextGrp = codeArchive[codeArchive.length - 1].grp;

        radio.setGroup(nextGrp);
        Send(nextCode);
    })
    /**/

    // beacon: 
    // <= "7" + serial
    //value = string { newgrp, newcode }, int = serial
    // => <encserial> : <newCode> & "grp" : <group>
    radio.onReceivedValue(function (recStr: string, recNum: number) {
        if (beacon) return;
        console.log("received");
        if (recStr == mySerial) {
            if (recNum == 0) {
                basic.showString("W")
            } else {
                const remoteID = radio.receivedPacket(RadioPacketProperty.SerialNumber);
                nextCode = recNum
                AddDataToCodeArchive(false, recNum);
                //codeArchive.push({ code: recNum })
                whaleysans.showNumber(recNum)

                console.logValue("Received value", recStr + " : " + recNum + "\n\r");
                console.logValue("Remote ID", remoteID + "\n\r");
                console.logValue("nextCode", nextCode);
            }

        } else if (recStr == "grp") {
            //nextGrp = recNum;
            //radio.setGroup(nextGrp);
            AddDataToCodeArchive(true, recNum);
            //codeArchive[codeArchive.length - 1].grp = recNum;
            //codeArchive.forEach(code => console.log(code));
            
            console.logValue("Received grp", recNum + "\n\r");
            console.logValue("nextGrp", recNum);
        }
    })
}

let dataCreated = false;

function AddDataToCodeArchive(grp : boolean, value ?: number){
    console.log("AddData");

    if (!dataCreated) {
        codeArchive.push(nData(NaN, NaN));
        dataCreated = true;
    }

    if (grp) codeArchive[codeArchive.length - 1].grp = value;
    else codeArchive[codeArchive.length - 1].code = value;

    let data = codeArchive[codeArchive.length - 1];

    if (dataIsFull(data)){
        OnFullDataReceived(data.grp);
    }
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