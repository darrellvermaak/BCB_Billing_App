import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';

export function IsBefore(
    property: string,
    validationOptions?: ValidationOptions,
) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: 'isBefore',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (args.object as any)[
                        relatedPropertyName
                    ];

                    if (!value || !relatedValue) return true; // handled by @IsISO8601 already
                    return new Date(value) < new Date(relatedValue);
                },
                defaultMessage(args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    return `${args.property} must be before ${relatedPropertyName}`;
                },
            },
        });
    };
}
