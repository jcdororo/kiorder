"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitingEntryController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const waiting_entry_service_1 = require("./waiting-entry.service");
const create_waiting_dto_1 = require("./dto/create-waiting.dto");
const update_waiting_status_dto_1 = require("./dto/update-waiting-status.dto");
const update_guest_response_dto_1 = require("./dto/update-guest-response.dto");
let WaitingEntryController = class WaitingEntryController {
    constructor(waitingEntryService) {
        this.waitingEntryService = waitingEntryService;
    }
    create(req, dto) {
        return this.waitingEntryService.create(req.user.userId, dto);
    }
    findAll(req) {
        return this.waitingEntryService.findAll(req.user.userId);
    }
    findOne(id) {
        return this.waitingEntryService.findOne(id);
    }
    updateStatus(id, dto) {
        return this.waitingEntryService.updateStatus(id, dto);
    }
    updateGuestResponse(id, dto) {
        return this.waitingEntryService.updateGuestResponse(id, dto);
    }
};
exports.WaitingEntryController = WaitingEntryController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_waiting_dto_1.CreateWaitingDto]),
    __metadata("design:returntype", void 0)
], WaitingEntryController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WaitingEntryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('status/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WaitingEntryController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_waiting_status_dto_1.UpdateWaitingStatusDto]),
    __metadata("design:returntype", void 0)
], WaitingEntryController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/guest-response'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_guest_response_dto_1.UpdateGuestResponseDto]),
    __metadata("design:returntype", void 0)
], WaitingEntryController.prototype, "updateGuestResponse", null);
exports.WaitingEntryController = WaitingEntryController = __decorate([
    (0, common_1.Controller)('waiting'),
    __metadata("design:paramtypes", [waiting_entry_service_1.WaitingEntryService])
], WaitingEntryController);
//# sourceMappingURL=waiting-entry.controller.js.map