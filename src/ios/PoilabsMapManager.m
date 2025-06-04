#import <React/RCTViewManager.h>
#import "__PROJECT_NAME__-Swift.h"

@interface PoilabsMapManager : RCTViewManager
@end

@implementation PoilabsMapManager

RCT_EXPORT_MODULE(PoilabsNavigationMap)
RCT_EXPORT_VIEW_PROPERTY(applicationId, NSString)
RCT_EXPORT_VIEW_PROPERTY(applicationSecret, NSString)
RCT_EXPORT_VIEW_PROPERTY(uniqueId, NSString)
RCT_EXPORT_VIEW_PROPERTY(language, NSString)
RCT_EXPORT_VIEW_PROPERTY(showOnMap, NSString)
RCT_EXPORT_VIEW_PROPERTY(getRouteTo, NSString)

- (UIView *)view
{
  return [[NavigationView alloc] init];
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end