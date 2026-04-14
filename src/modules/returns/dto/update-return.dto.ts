import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerReturnDto, CreateSupplierReturnDto } from './create-return.dto';

export class UpdateCustomerReturnDto extends PartialType(CreateCustomerReturnDto) {}

export class UpdateSupplierReturnDto extends PartialType(CreateSupplierReturnDto) {}
