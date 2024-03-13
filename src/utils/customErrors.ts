export class UnableToCheckRentalStatusError extends Error {
  constructor(message?: string) {
    super(
      message ||
        'Sorry, we have been unable to check the subscription status. Please try again later',
    );
  }
}

export class NotRentedItemError extends Error {
  constructor(message?: string) {
    super(
      message ||
        'Please go to the Royal Opera House website to find out how to access this item',
    );
  }
}

export class NonSubscribedStatusError extends Error {
  constructor(message?: string) {
    super(message);
  }
}
