#import "React/RCTUIManager.h"

@interface ReactiveUIViewControllerManager ()

@end

@implementation ReactiveUIViewControllerManager

RCT_EXPORT_MODULE()

- (UIView*)view
{
    return [[ReactiveUIViewController alloc] init];
}

@end