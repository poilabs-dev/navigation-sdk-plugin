#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>
#import <PoilabsNavigation/PoilabsNavigation.h>

@interface PoilabsNavigationModule : NSObject <RCTBridgeModule>
@end

@implementation PoilabsNavigationModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(initWithAppId:(NSString *)appId
                  andSecret:(NSString *)appSecret
                  uniqueId:(NSString *)uniqueId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    dispatch_async(dispatch_get_main_queue(), ^{
      PLNNavigationSettings *settings = [PLNNavigationSettings sharedInstance];
      settings.applicationId = appId;
      settings.applicationSecret = appSecret;
      settings.navigationUniqueIdentifier = uniqueId;
      resolve(@(YES));
    });
  } @catch (NSException *exception) {
    reject(@"INIT_ERROR", exception.reason, nil);
  }
}

RCT_EXPORT_METHOD(getReadyForStoreMap:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        dispatch_async(dispatch_get_main_queue(), ^{
            [[PLNavigationManager sharedInstance] getReadyForStoreMapWithCompletionHandler:^(id _Nullable error) {
                NSError *nsError = (NSError *)error;
                if (nsError) {
                    reject(@"GETREADY_ERROR", nsError.localizedDescription, nsError);
                } else {
                    resolve(@YES);
                }
            }];
        });
    } @catch (NSException *exception) {
        reject(@"GETREADY_ERROR", exception.reason, nil);
    }
}

@end