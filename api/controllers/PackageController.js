/**
 * PackageController
 *
 * @description :: Server-side logic for managing packages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {


  /**
  * @api {get} /packages/:name Request Package Information
  * @apiName Get Package
  * @apiGroup Package
  *
  * @apiParam {String} name Name of the package
  *
  * @apiUse Timestamps
  * @apiSuccess {String}   name                   Package name
  * @apiSuccess {String}   latest_version_id      Last version (more recent) of this package
  * @apiSuccess {String}   uri                    Url to `self`
  * @apiSuccess {Object[]} versions               List of versions of this package
  * @apiSuccess {String}   versions.url           Url to this version
  * @apiSuccess {String}   versions.package_url   Url to the package of this version
  * @apiSuccess {String}   versions.id            Id of this version
  * @apiSuccess {String}   versions.package_name  Name of the package of this version
  * @apiSuccess {String}   versions.version       String describing the version of the package
  * @apiSuccess {String}   versions.title         Title of the version
  * @apiSuccess {String}   versions.description   Description of the package version
  * @apiSuccess {Date}     versions.release_date  Release date of the package version
  * @apiSuccess {String}   versions.license       License of the package version
  * @apiSuccess {String}   versions.maintainer_id Id of the maintainer of the package version
  */

  findByName: function(req, res) {
    var packageName = req.param('name');

    Package.findOne({
      where: {
        name: packageName,
      },
      include: [
        { model: PackageVersion, as: 'versions' },
      ]
    }).then(function(package) {
      package.versions.sort(PackageVersion.compareVersion);
      if(package === null) {
        return res.rstudio_redirect(301, '/search?q=' + encodeURIComponent(packageName));
        //there seems to be a problem with redirected requests if text/html is set as contentype for the ajax request, so I just
        //adapt this so Rstudio still gets the html
      } else if(req.wantsJSON &&!req.param("viewer_pane")==1) {
        return res.json(package);
      } else {
        if (package.versions.length === 0)
          return Package.findOne({
            where: {name: packageName},
            include: [{ model: PackageVersion, attributes: ['package_name', 'version', 'id'], as: 'reverse_dependencies'}]
          }).then(function(packageInstance) {
            if(packageInstance === null) return res.notFound();
            var package = packageInstance.toJSON();
            package.pageTitle = packageInstance.name;
            return res.ok(package, 'package/show.ejs');
          });
        else return res.rstudio_redirect(301, package.versions[package.versions.length - 1].uri);
      }
    }).catch(function(err) {
      return res.negotiate(err);
    });

  },

  /**
  * @api {get} /packages List all packages
  * @apiName Get Packages
  * @apiGroup Package
  * @apiDescription Return an array of package object containing listed attributes
  *
  * @apiParam {String} limit    the number to use when limiting records to send back (useful for pagination)
  * @apiParam {String} skip     the number of records to skip when limiting (useful for pagination)
  * @apiParam {String} sort     the order of returned records, e.g. `name ASC` or `name DESC`
  *
  * @apiSuccess {String}   name                   Package name
  * @apiSuccess {String}   latest_version_id      Last version (more recent) of this package
  * @apiSuccess {String}   uri                    Url to `self`
  * @apiUse Timestamps
  */
  find: function(req, res) {
    var limit = Utils.parseLimit(req),
      offset = Utils.parseSkip(req),
      sort = Utils.parseSort(req),
      criteria = Utils.parseCriteria(req);

    Package.findAll({
      where: criteria,
      limit: limit,
      offset: offset,
      order: sort,
      include: []
    }).then(function(packages) {
      return res.json(packages);
    }).catch(function(err) {
      return res.negotiate(err);
    });

  },

  toggleStar: function(req, res) {
    var packageName = req.param('name');
    var user = req.user;

    RedisService.delPrefix("view_package_version_"+packageName)

    Star.findOrCreate({
      where: {
        user_id: user.id,
        package_name: packageName
      }
    }).spread(function(instance, created) {
      var destroyPromise = created ? Promise.resolve() : instance.destroy();
      destroyPromise.then(function() {
        return Star.findAll({
          where: { package_name: packageName }
        }).then(function(stars) {
          var newCount = stars.length;
          if (created) {
            res.created({
              newCount: newCount,
              star: instance
            });
          } else
            return res.send(200, {
              newCount: newCount,
              star: 'deleted'
            });
        });

      });
    }).catch(function(err) {
      return res.negotiate(err);
    });
  }

  /**
  * @api {post} /packages Create a new package
  * @apiName Create Package
  * @apiGroup Package
  * @apiDescription Return the newly created resource
  * Note: The Location header contains a url to the newly created resource
  *
  * @apiParam {String} name                The name of the package to be created
  * @apiParam {String} [latest_version_id] The id of the latest package version
  *
  * @apiSuccess {String}   name                   Package name
  * @apiSuccess {String}   latest_version_id      Last version (more recent) of this package
  * @apiSuccess {String}   uri                    Url to `self`
  * @apiUse Timestamps
  */


};

