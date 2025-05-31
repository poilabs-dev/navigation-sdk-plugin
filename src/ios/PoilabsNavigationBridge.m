#import <Foundation/Foundation.h>
#import "PoilabsNavigationBridge.h"
#import <PoilabsNavigation/PoilabsNavigation.h>

@interface PoilabsNavigationBridge()
@property (nonatomic, assign) BOOL isInitialized;
@end

@implementation PoilabsNavigationBridge

RCT_EXPORT_MODULE(PoilabsNavigationBridge);

- (instancetype)init {
    self = [super init];
    if (self) {
        _isInitialized = NO;
    }
    return self;
}

RCT_EXPORT_METHOD(showPointOnMap:(NSString *)storeId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NSDictionary* userInfo = @{@"storeId": storeId};
    [[NSNotificationCenter defaultCenter] postNotificationName:@"showPointOnMap" object:self userInfo:userInfo];
  });
}

RCT_EXPORT_METHOD(getRouteTo:(NSString *)storeId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    NSDictionary* userInfo = @{@"storeId": storeId};
    [[NSNotificationCenter defaultCenter] postNotificationName:@"getRouteTo" object:self userInfo:userInfo];
  });
}

RCT_EXPORT_METHOD(setApplicationConfig:(NSString *)applicationId 
                            secretKey:(NSString *)secretKey 
                             uniqueId:(NSString *)uniqueId) {
  dispatch_async(dispatch_get_main_queue(), ^{
    // Update the NavigationView configuration
    NSDictionary* userInfo = @{
      @"applicationId": applicationId,
      @"secretKey": secretKey,
      @"uniqueId": uniqueId
    };
    [[NSNotificationCenter defaultCenter] postNotificationName:@"updateConfig" object:self userInfo:userInfo];
  });
}

RCT_EXPORT_METHOD(initNavigationSDK:(NSString *)applicationId
                  applicationSecret:(NSString *)applicationSecret
                  uniqueId:(NSString *)uniqueId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        dispatch_async(dispatch_get_main_queue(), ^{
            PLNNavigationSettings *settings = [PLNNavigationSettings sharedInstance];
            settings.applicationId = applicationId;
            settings.applicationSecret = applicationSecret;
            settings.navigationUniqueIdentifier = uniqueId;
            settings.applicationLanguage = @"en";
            
            self.isInitialized = YES;
            
            NSLog(@"Poilabs Navigation SDK initialized successfully");
            resolve(@(YES));
        });
    } @catch (NSException *exception) {
        NSLog(@"Error initializing Poilabs Navigation SDK: %@", exception.reason);
        reject(@"INIT_ERROR", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(getReadyForStoreMap:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!self.isInitialized) {
        reject(@"NOT_INITIALIZED", @"SDK not initialized. Call initNavigationSDK first.", nil);
        return;
    }
    
    @try {
        dispatch_async(dispatch_get_main_queue(), ^{
            [[PLNavigationManager sharedInstance] getReadyForStoreMapWithCompletionHandler:^(id _Nullable error) {
                if (error) {
                    NSError *nsError = (NSError *)error;
                    reject(@"PREP_ERROR", nsError.localizedDescription, nsError);
                } else {
                    resolve(@(YES));
                }
            }];
        });
    } @catch (NSException *exception) {
        reject(@"PREP_ERROR", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(startPositioning:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!self.isInitialized) {
        reject(@"NOT_INITIALIZED", @"SDK not initialized", nil);
        return;
    }
    
    @try {
        dispatch_async(dispatch_get_main_queue(), ^{
            [[PLNavigationManager sharedInstance] initWithAppId:[PLNNavigationSettings sharedInstance].applicationId
                                                      andSecret:[PLNNavigationSettings sharedInstance].applicationSecret
                                                       uniqueId:[PLNNavigationSettings sharedInstance].navigationUniqueIdentifier];
            resolve(@(YES));
        });
    } @catch (NSException *exception) {
        reject(@"POSITIONING_ERROR", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(stopPositioning:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        dispatch_async(dispatch_get_main_queue(), ^{
            resolve(@(YES));
        });
    } @catch (NSException *exception) {
        reject(@"POSITIONING_ERROR", exception.reason, nil);
    }
}

// PoiMapModule arayüzünü implemente eden yöntemler - uyumluluk için
RCT_EXPORT_METHOD(showPointOnMap:(NSArray *)storeIds
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!self.isInitialized) {
        reject(@"NOT_INITIALIZED", @"SDK not initialized", nil);
        return;
    }
    
    @try {
        dispatch_async(dispatch_get_main_queue(), ^{
            if (storeIds.count > 0) {
                NSString *storeId = storeIds[0];
                [[NSNotificationCenter defaultCenter] postNotificationName:@"showPointOnMap" 
                                                                    object:nil 
                                                                  userInfo:@{@"storeId": storeId}];
            }
            resolve([NSNull null]);
        });
    } @catch (NSException *exception) {
        reject(@"SHOW_POINT_ERROR", exception.reason, nil);
    }
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

@end