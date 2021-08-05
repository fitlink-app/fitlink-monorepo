import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query
} from '@nestjs/common'
import { OrganisationsService } from './organisations.service'
import {
  CreateOrganisationDto,
  CreateOrganisationDtoResult
} from './dto/create-organisation.dto'
import { UpdateOrganisationDto } from './dto/update-organisation.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/user-roles.constants'
import { Files } from '../../decorators/files.decorator'
import { ImagesService } from '../images/images.service'
import { Uploads, UploadOptions } from '../../decorators/uploads.decorator'
import {
  ApiBaseResponses,
  DeleteResponse,
  UpdateResponse
} from '../../decorators/swagger.decorator'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { Organisation } from './entities/organisation.entity'
import { PaginationQuery } from '../../helpers/paginate'
import { Pagination } from '../../decorators/pagination.decorator'
import { SearchOrganisationDto } from './dto/search-organisation.dto'
import { User } from '../users/entities/user.entity'

@ApiTags('organisations')
@ApiBaseResponses()
@Controller('organisations')
export class OrganisationsController {
  constructor(
    private readonly organisationsService: OrganisationsService,
    private readonly imagesService: ImagesService
  ) {}

  /**
   * Creates an organisation
   * @param createOrganisationDto
   * @returns
   */
  @Iam(Roles.SuperAdmin)
  @Uploads('avatar', UploadOptions.Nullable)
  @Post()
  @ApiResponse({ type: CreateOrganisationDtoResult, status: 201 })
  async create(
    @Files('avatar') file: Storage.MultipartFile,
    @Body() createOrganisationDto: CreateOrganisationDto
  ) {
    let image = {}
    if (file) {
      const avatar = await this.imagesService.createOne(file)
      image = { avatar }
    }
    return this.organisationsService.create({
      ...createOrganisationDto,
      ...image
    })
  }

  /**
   * Gets all organisations
   * @param request
   * @returns
   */
  @Iam(Roles.SuperAdmin)
  @Get()
  @ApiResponse({ type: Organisation, isArray: true, status: 200 })
  findAll(
    @Pagination() pagination: PaginationQuery,
    @Query() query: SearchOrganisationDto
  ) {
    return this.organisationsService.findAll(pagination, query)
  }

  /**
   * Gets a single organisation
   * @param id
   * @returns
   */
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Get(':organisationId')
  @ApiResponse({ type: Organisation, status: 200 })
  findOne(@Param('organisationId') id: string) {
    return this.organisationsService.findOne(id)
  }

  /**
   * Updates a single organisation
   * @param id
   * @param updateOrganisationDto
   * @returns
   */
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Put(':organisationId')
  @UpdateResponse()
  update(
    @Param('organisationId') id: string,
    @Body() updateOrganisationDto: UpdateOrganisationDto
  ) {
    return this.organisationsService.update(id, updateOrganisationDto)
  }

  /**
   * Deletes a single organisation
   * @param id
   * @returns
   */
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Delete(':organisationId')
  @DeleteResponse()
  remove(@Param('organisationId') id: string) {
    return this.organisationsService.remove(id)
  }

  /**
   * Gets all users within organisation
   * @param request
   * @returns
   */
  @Iam(Roles.SuperAdmin)
  @Get(':organisationId/users')
  @ApiResponse({ type: User, isArray: true, status: 200 })
  findAllUsers(
    @Pagination() pagination: PaginationQuery,
    @Query() query,
    @Param('organisationId') id: string
  ) {
    return this.organisationsService.findAllUsers(id, query, pagination)
  }
}
