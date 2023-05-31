export const filterObj = ( obj: Response["body"], ...allowedFields: Array<string> ) => {
    type StringToObject<T extends string[]> = {
    [K in T[number]]: string;
    };

    const newObj: StringToObject<string[]> = {};

    if ( obj ) Object.keys ( obj ).forEach ( el => {
    	if ( allowedFields.includes ( el ) ) newObj[el] = obj[el];
    } );
};