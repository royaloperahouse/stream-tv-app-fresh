#import "ReactiveUIViewController.h"

// https://developer.apple.com/documentation/avfoundation
#import <AVFoundation/AVFoundation.h>

// https://developer.apple.com/documentation/avkit
#import <AVKit/AVKit.h>

@implementation ReactiveUIViewController

- (instancetype)init
{
    self = [super init];
    return self;
}

- (void)dealloc {}

- (void)layoutSubviews
{
    [super layoutSubviews];

    if (_reactiveUIViewController == nil) return;

    _reactiveUIViewController.view.frame = self.frame
}

- (void)removeFromSuperview
{
    if (_reactiveUIViewController == nil) return;

    [_reactiveUIViewController willMoveToParentViewController:nil];
    [_reactiveUIViewController.view removeFromSuperview];
    [_reactiveUIViewController removeFromParentViewController];
    _reactiveUIViewController = nil;
    [super removeFromSuperview];
}

- (void)addViewControllerAsSubview
{
    _reactiveUIViewController = [UIViewController new];
    UIWindow *window = (UIWindow*)[[UIApplication sharedApplication] keyWindow];

    [window.rootViewController addChildViewController:_reactiveUIViewController];

    _reactiveUIViewController.view.frame = self.superview.frame;
    [self addSubview:_reactiveUIViewController.view];
    [_reactiveUIViewController didMoveToParentViewController:window.rootViewController];
}

- (void)didSetProps:(__unused NSArray<NSString *> *)changedProps
{
    [super didSetProps:changedProps];
}

@end