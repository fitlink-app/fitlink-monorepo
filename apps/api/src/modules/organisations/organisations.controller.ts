import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  BadRequestException
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
import { User, UserPublicPagination } from '../users/entities/user.entity'
import { AuthenticatedUser } from '../../models'
import { User as AuthUser } from '../../decorators/authenticated-user.decorator'
import { RespondOrganisationsInvitationDto } from '../organisations-invitations/dto/respond-organisations-invitation.dto'
import {
  OrganisationsInvitationsService,
  OrganisationsInvitationsServiceError
} from '../organisations-invitations/organisations-invitations.service'
import { VerifyOrganisationsInvitationDto } from '../organisations-invitations/dto/verify-organisations-invitation.dto'
import { Public } from '../../decorators/public.decorator'

@ApiTags('organisations')
@ApiBaseResponses()
@Controller()
export class OrganisationsController {
  constructor(
    private readonly organisationsService: OrganisationsService,
    private readonly invitationsService: OrganisationsInvitationsService,
    private readonly imagesService: ImagesService
  ) {}

  /**
   * Creates an organisation
   * @param createOrganisationDto
   * @returns
   */
  @Iam(Roles.SuperAdmin)
  @Uploads('avatar', UploadOptions.Nullable)
  @Post('/organisations')
  @ApiResponse({ type: CreateOrganisationDtoResult, status: 201 })
  async create(
    @Files('avatar') file: import('@fastify/multipart').MultipartFile,
    @Body() createOrganisationDto: CreateOrganisationDto,
    @AuthUser() user: AuthenticatedUser
  ) {
    let image = {}
    if (file) {
      const avatar = await this.imagesService.createOne(file)
      image = { avatar }
    }
    return this.organisationsService.create(
      {
        ...createOrganisationDto,
        ...image
      },
      user.id
    )
  }

  /**
   * Gets all organisations
   * @param request
   * @returns
   */
  @Iam(Roles.SuperAdmin)
  @Get('/organisations')
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
  @Get('/organisations/:organisationId')
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
  @Put('/organisations/:organisationId')
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
  @Delete('/organisations/:organisationId')
  @DeleteResponse()
  remove(@Param('organisationId') id: string) {
    return this.organisationsService.remove(id)
  }

  @Post('/organisations-invitations/respond')
  async accept(
    @Body() { token, accept }: RespondOrganisationsInvitationDto,
    @AuthUser() user: AuthenticatedUser
  ) {
    const result = await this.organisationsService.respondToInvitation(
      token,
      accept,
      user.id
    )
    if (typeof result === 'string') {
      throw new BadRequestException(result)
    }
    return result
  }

  /**
   * Gets all users within organisation
   * @param request
   * @returns
   */
  // @Iam(Roles.SuperAdmin)
  // @Get(':organisationId/users')
  // @ApiResponse({ type: UserPublicPagination, status: 200 })
  // findAllUsers(
  //   @Pagination() pagination: PaginationQuery,
  //   @Query() query,
  //   @Param('organisationId') id: string
  // ) {
  //   return this.organisationsService.findAllUsers(id, query, pagination)
  // }

  /**
   * Verifies that a token is still valid. This is useful
   * in the UI layer to tell the user whether they can
   * still proceed with creating an account, or alternatively
   * with merging the organisation under their current login.
   *
   * Throws an UnauthorizedException if the token is no
   * longer valid.
   *
   * @param token
   * @returns boolean
   */
  @Public()
  @Post('organisations-invitations/verify')
  async verify(@Body() { token }: VerifyOrganisationsInvitationDto) {
    const result = await this.invitationsService.verifyToken(token)

    if (typeof result === 'string') {
      throw new BadRequestException(result)
    }

    if (!result) {
      throw new BadRequestException(
        OrganisationsInvitationsServiceError.TokenNotFound
      )
    }

    return result
  }

  @Iam(Roles.OrganisationAdmin)
  @Get('/organisations/:organisationId/stats')
  findAllUsersAndStats(
    @Param('organisationId') organisationId: string,
    @Pagination() pagination: PaginationQuery
  ) {
    return this.organisationsService.queryUserOrganisationStats(
      organisationId,
      pagination
    )
  }
}
