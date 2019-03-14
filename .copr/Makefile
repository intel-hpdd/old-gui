srpm:
	dnf install -y npm;\
	rm -rf /tmp/_topdir;\
	rm -rf /tmp/scratch;\
	mkdir -p /tmp/_topdir/SOURCES;\
	mkdir -p /tmp/scratch;\
	cp -r ./* /tmp/scratch;\
	cd /tmp/scratch;\
	npm pack;\
	cp iml-old-gui*.tgz /tmp/_topdir/SOURCES;\
	cd /tmp/_topdir/SOURCES;\
	rpmbuild -bs --define "_topdir /tmp/_topdir" /tmp/scratch/iml-old-gui.spec;\
	cp -r /tmp/_topdir/SRPMS/* $(outdir)