export const filterObj = <T extends Record<string, unknown>>( obj: T, ...allowedFields: Array<keyof T> ): Partial<T> => {
	const newObj: Partial<T> = {};

	obj &&
		Object.keys ( obj ).forEach ( el => {
			if ( allowedFields.includes ( el as keyof T ) ) {
				newObj[el as keyof T] = obj[el] as T[keyof T];
			}
		} );

	return newObj;
};
