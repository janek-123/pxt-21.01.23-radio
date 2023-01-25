type Data = { code: number, grp?: number }
function nData(code: number, grp: number): Data { return { code, grp }; }

function dataIsFull(data: Data) : boolean{
    return data.code != NaN && data.grp != NaN;
}