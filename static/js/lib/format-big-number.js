//
// Copyright (c) 2019 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

export default function (num, precision, strict = false) {
  const units = ['', 'k', 'M', 'B', 'T'];
  num = $.isNumeric(num) ? num : 0;
  precision = $.isNumeric(precision) ? precision : 3;

  const sign = num < 0 ? '-' : '';
  num = Math.abs(num);

  let pwr = Math.floor(Math.log(num) / Math.log(1000));

  pwr = Math.min(pwr, units.length - 1);
  pwr = Math.max(pwr, 0);
  num /= Math.pow(1000, pwr);

  const formatOptions = {
    maximumSignificantDigits: precision,
    maximumFractionDigits: precision
  };

  if (strict) formatOptions.minimumSignificantDigits = precision;

  const formatter = new Intl.NumberFormat('en-us', formatOptions);

  return sign + formatter.format(num) + units[pwr];
};