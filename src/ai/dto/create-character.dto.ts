import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MinLength, Length, MaxLength } from 'class-validator';

export class CreateCharacterDto {
  @ApiProperty({ example: 'Aquamarine' })
  @Transform(
    ({ value }) =>
      value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase().trim(),
  )
  @IsOptional()
  @MinLength(2)
  @MaxLength(25)
  eyeColor?: string;

  @ApiProperty({ example: 'Blonde' })
  @Transform(
    ({ value }) =>
      value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase().trim(),
  )
  @IsOptional()
  @MinLength(2)
  @MaxLength(64)
  hairColor?: string;

  @ApiProperty({ example: 'Fit' })
  @Transform(
    ({ value }) =>
      value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase().trim(),
  )
  @IsOptional()
  @MinLength(2)
  @MaxLength(64)
  constitution?: string;

  @ApiProperty({ example: 'Gorgeous' })
  @Transform(
    ({ value }) =>
      value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase().trim(),
  )
  @IsOptional()
  @MinLength(2)
  @MaxLength(64)
  characteristic?: string;

  @ApiProperty({ example: 'Nurse' })
  @Transform(
    ({ value }) =>
      value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase().trim(),
  )
  @IsOptional()
  @MinLength(2)
  @MaxLength(64)
  job?: string;

  @ApiProperty({ example: 'East-european' })
  @Transform(
    ({ value }) =>
      value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase().trim(),
  )
  @IsOptional()
  @MinLength(2)
  @MaxLength(32)
  phenotype?: string;

  @ApiProperty({ example: 'Easygoing, Ambitious' })
  @Transform(({ value }) =>
    value?.map(
      (item) =>
        item?.charAt(0).toUpperCase() + item?.slice(1).toLowerCase().trim(),
    ),
  )
  @IsOptional()
  @MinLength(2)
  @MaxLength(128)
  temperament?: string[];

  @ApiProperty({ example: 23 })
  @IsOptional()
  @Length(2)
  age?: number;

  @ApiProperty({ example: 'Alice' })
  @Transform(
    ({ value }) =>
      value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase().trim(),
  )
  @IsOptional()
  @MinLength(2)
  @MaxLength(64)
  firstName?: string;

  @ApiProperty({ example: 'Smith' })
  @Transform(
    ({ value }) =>
      value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase().trim(),
  )
  @IsOptional()
  @MinLength(2)
  @MaxLength(64)
  lastName?: string;

  @ApiProperty({ example: 'Attack helicopter' })
  @Transform(
    ({ value }) =>
      value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase().trim(),
  )
  @IsOptional()
  @MinLength(2)
  @MaxLength(64)
  gender?: string;
}
