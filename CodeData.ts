type Data = { code?: number, grp?: number }

function nData(code: number, grp: number): Data { return { code, grp }; }
function dataIsFull(data: Data): boolean { return !isNaN(data.code) && !isNaN(data.grp); }