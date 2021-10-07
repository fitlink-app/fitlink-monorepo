import {
  Global,
  Module,
  DynamicModule,
  Provider,
  Injectable,
  ModuleMetadata
} from '@nestjs/common'
import * as admin from 'firebase-admin'

const FIREBASE_ADMIN_MODULE_OPTIONS = 'FIREBASE_ADMIN_MODULE_OPTIONS'

@Injectable()
export class FirebaseAdminService {
  application: admin.app.App

  constructor(app: admin.app.App) {
    this.application = app
  }

  app() {
    return this.application
  }
}

@Global()
@Module({})
export class FirebaseAdminCoreModule {
  static forRootAsync(options: FirebaseAdminModuleAsyncOptions): DynamicModule {
    const firebaseAdminModuleOptions = {
      provide: FIREBASE_ADMIN_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || []
    }

    const provider = this.createAsyncProviders()

    return {
      module: FirebaseAdminCoreModule,
      imports: options.imports,
      providers: [firebaseAdminModuleOptions, provider],
      exports: [FirebaseAdminService]
    }
  }

  private static createAsyncProviders(): Provider<FirebaseAdminService> {
    return {
      provide: FirebaseAdminService,
      useFactory: (options: FirebaseAdminModuleOptions) => {
        const app =
          admin.apps.length === 0 ? admin.initializeApp(options) : admin.apps[0]
        return new FirebaseAdminService(app)
      },
      inject: [FIREBASE_ADMIN_MODULE_OPTIONS]
    }
  }
}

export interface FirebaseAdminModuleOptions extends admin.AppOptions {}

export interface FirebaseAdminModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string
  useFactory?: (
    ...args: any[]
  ) => Promise<FirebaseAdminModuleOptions> | FirebaseAdminModuleOptions
  inject?: any[]
}
