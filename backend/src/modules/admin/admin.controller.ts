import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole, ReportStatus } from '../../common/enums';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';
import {
  AdminListQueryDto,
  ResolveReportDto,
  RevenueDryRunDto,
  SuspendUserDto,
  UpsertFeatureFlagDto,
  UpsertSystemSettingDto,
} from './dto/admin.dto';

interface AdminRequest {
  user: { id: string; role: UserRole };
}

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: list users' })
  listUsers(@Query() query: AdminListQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Get('users/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: get user detail' })
  getUserDetail(@Param('id') userId: string) {
    return this.adminService.getUserDetail(userId);
  }

  @Patch('users/:id/suspend')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: suspend user' })
  suspendUser(
    @Request() req: AdminRequest,
    @Param('id') userId: string,
    @Body() dto: SuspendUserDto,
  ) {
    return this.adminService.suspendUser(req.user, userId, dto.reason);
  }

  @Patch('users/:id/restore')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: restore suspended user' })
  restoreUser(@Request() req: AdminRequest, @Param('id') userId: string) {
    return this.adminService.restoreUser(req.user, userId);
  }

  @Get('reports')
  @Roles(UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: list reports' })
  listReports(@Query() query: AdminListQueryDto) {
    return this.adminService.listReports(query);
  }

  @Patch('reports/:id/resolve')
  @Roles(UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: resolve report' })
  resolveReport(
    @Request() req: AdminRequest,
    @Param('id') reportId: string,
    @Body() dto: ResolveReportDto,
  ) {
    const status = dto.status || ReportStatus.RESOLVED;
    return this.adminService.resolveReport(
      req.user,
      reportId,
      status,
      dto.resolution,
    );
  }

  @Get('transactions')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: list transactions' })
  listTransactions(@Query() query: AdminListQueryDto) {
    return this.adminService.listTransactions(query);
  }

  @Get('founders')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: list founders' })
  listFounders(@Query() query: AdminListQueryDto) {
    return this.adminService.listFounders(query);
  }

  @Get('revenue-distributions')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: list revenue distributions' })
  listRevenueDistributions(@Query() query: AdminListQueryDto) {
    return this.adminService.listRevenueDistributions(query);
  }

  @Post('revenue-distributions/dry-run')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: dry-run monthly revenue sharing' })
  dryRunRevenueSharing(
    @Request() req: AdminRequest,
    @Body() dto: RevenueDryRunDto,
  ) {
    return this.adminService.dryRunRevenueSharing(req.user, dto.month);
  }

  @Get('system-settings')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: list system settings' })
  listSystemSettings() {
    return this.adminService.listSystemSettings();
  }

  @Patch('system-settings/:key')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: upsert system setting' })
  upsertSystemSetting(
    @Request() req: AdminRequest,
    @Param('key') key: string,
    @Body() dto: UpsertSystemSettingDto,
  ) {
    return this.adminService.upsertSystemSetting(req.user, key, dto);
  }

  @Get('feature-flags')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: list feature flags' })
  listFeatureFlags() {
    return this.adminService.listFeatureFlags();
  }

  @Patch('feature-flags/:key')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: upsert feature flag' })
  upsertFeatureFlag(
    @Request() req: AdminRequest,
    @Param('key') key: string,
    @Body() dto: UpsertFeatureFlagDto,
  ) {
    return this.adminService.upsertFeatureFlag(req.user, key, dto);
  }
}
