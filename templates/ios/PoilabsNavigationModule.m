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
            PLNNavigationSettings.sharedInstance().applicationId = appId;
            PLNNavigationSettings.sharedInstance().applicationSecret = appSecret;
            PLNNavigationSettings.sharedInstance().navigationUniqueIdentifier = uniqueId;
            
            resolve(@YES);
        });
    } @catch (NSException *exception) {
        reject(@"INIT_ERROR", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(getReadyForStoreMap:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    @try {
        dispatch_async(dispatch_get_main_queue(), ^{
            [PLNavigationManager.sharedInstance getReadyForStoreMapWithCompletionHandler:^(NSError * _Nullable error) {
                if (error) {
                    reject(@"GETREADY_ERROR", error.localizedDescription, error);
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