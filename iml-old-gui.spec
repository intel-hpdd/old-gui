%define base_name old-gui

Name:       iml-%{base_name}
Version:    3.1.2
# Release Start
Release:    1%{?dist}
# Release End
Summary:    Transitional GUI.
License:    MIT
Group:      System Environment/Libraries
URL:        https://github.com/whamcloud/%{base_name}
Source0:    %{name}-%{version}.tgz

BuildRequires: nodejs-packaging
BuildArch: noarch

%description
Transitional GUI.

%prep
%setup -q -n package

%build
#nothing to do

%install
mkdir -p %{buildroot}%{nodejs_sitelib}/@iml/%{base_name}
cp -al . %{buildroot}%{nodejs_sitelib}/@iml/%{base_name}

%clean
rm -rf %{buildroot}

%files
%{nodejs_sitelib}

%changelog
* Thu Mar 14 2019 Will Johnson <wjohnson@whamcloud.com> - 3.1.0-1
- Integrate wasm action-dropdown to old pages
- Update repo to work with copr builder
* Fri Oct 26 2018 Will Johnson <wjohnson@whamcloud.com> - 3.0.1-1
- Fix double scrollbar issue
* Tue Jun 19 2018 Joe Grund <jgrund@whamcloud.com> - 3.0.0-1
- Build using FAKE
- Initial standalone RPM package
