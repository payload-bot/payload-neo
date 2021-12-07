import { IsValidLanguage } from "#api/shared/language.validator";
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateGuildDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  botName!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  prefix!: string;

  @IsOptional()
  @IsBoolean()
  enableSnipeForEveryone!: boolean;

  @IsOptional()
  @IsValidLanguage()
  language!: string;

  @IsOptional()
  @IsString({ each: true })
  restrictions!: string[];
}
